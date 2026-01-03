'use client';

import { useState } from 'react';
import { Download, FileText, Table, Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface BudgetExportData {
  eventName: string;
  eventDate: string;
  totalBudget: number;
  totalCommitted: number;
  totalPaid: number;
  totalPending: number;
  categories: {
    name: string;
    planned: number;
    committed: number;
    paid: number;
    pending: number;
    vendors: {
      name: string;
      amount: number;
      paid: number;
      pending: number;
      status: string;
    }[];
  }[];
}

interface Props {
  data: BudgetExportData;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetExport({ data }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'csv' | null>(null);
  const [showModal, setShowModal] = useState(false);

  const generateCSV = () => {
    const rows: string[][] = [];

    // Header
    rows.push(['Wedding Budget Report']);
    rows.push([`Event: ${data.eventName}`]);
    rows.push([`Date: ${data.eventDate}`]);
    rows.push([`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`]);
    rows.push([]);

    // Summary
    rows.push(['BUDGET SUMMARY']);
    rows.push(['Total Budget', formatCurrency(data.totalBudget)]);
    rows.push(['Total Committed', formatCurrency(data.totalCommitted)]);
    rows.push(['Total Paid', formatCurrency(data.totalPaid)]);
    rows.push(['Total Pending', formatCurrency(data.totalPending)]);
    rows.push([]);

    // Category details
    rows.push(['CATEGORY BREAKDOWN']);
    rows.push(['Category', 'Planned', 'Committed', 'Paid', 'Pending', 'Status']);

    data.categories.forEach((cat) => {
      const status = cat.committed > cat.planned ? 'Over Budget' : cat.paid === cat.committed ? 'Paid' : 'Pending';
      rows.push([
        cat.name,
        formatCurrency(cat.planned),
        formatCurrency(cat.committed),
        formatCurrency(cat.paid),
        formatCurrency(cat.pending),
        status,
      ]);
    });

    rows.push([]);

    // Vendor details
    rows.push(['VENDOR PAYMENTS']);
    rows.push(['Category', 'Vendor', 'Amount', 'Paid', 'Pending', 'Status']);

    data.categories.forEach((cat) => {
      cat.vendors.forEach((vendor) => {
        rows.push([
          cat.name,
          vendor.name,
          formatCurrency(vendor.amount),
          formatCurrency(vendor.paid),
          formatCurrency(vendor.pending),
          vendor.status,
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csvContent;
  };

  const downloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const generatePrintablePage = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wedding Budget Report - ${data.eventName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e11d48; padding-bottom: 20px; }
          .header h1 { font-size: 28px; color: #e11d48; margin-bottom: 5px; }
          .header p { color: #666; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
          .summary-card .label { font-size: 12px; color: #666; text-transform: uppercase; }
          .summary-card .value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .summary-card.total .value { color: #111; }
          .summary-card.committed .value { color: #d97706; }
          .summary-card.paid .value { color: #16a34a; }
          .summary-card.pending .value { color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f3f4f6; text-align: left; padding: 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          tr:hover { background: #f9fafb; }
          .section-title { font-size: 18px; font-weight: 600; margin: 30px 0 15px; color: #374151; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
          .status-paid { background: #dcfce7; color: #16a34a; }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-over { background: #fee2e2; color: #dc2626; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.eventName}</h1>
          <p>Budget Report • ${data.eventDate}</p>
          <p style="font-size: 12px; margin-top: 10px;">Generated on ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
        </div>

        <div class="summary">
          <div class="summary-card total">
            <div class="label">Total Budget</div>
            <div class="value">${formatCurrency(data.totalBudget)}</div>
          </div>
          <div class="summary-card committed">
            <div class="label">Committed</div>
            <div class="value">${formatCurrency(data.totalCommitted)}</div>
          </div>
          <div class="summary-card paid">
            <div class="label">Paid</div>
            <div class="value">${formatCurrency(data.totalPaid)}</div>
          </div>
          <div class="summary-card pending">
            <div class="label">Pending</div>
            <div class="value">${formatCurrency(data.totalPending)}</div>
          </div>
        </div>

        <div class="section-title">Category Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Planned</th>
              <th style="text-align: right;">Committed</th>
              <th style="text-align: right;">Paid</th>
              <th style="text-align: right;">Pending</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.categories
              .map((cat) => {
                const status = cat.committed > cat.planned ? 'Over Budget' : cat.paid === cat.committed ? 'Paid' : 'Pending';
                const statusClass = cat.committed > cat.planned ? 'status-over' : cat.paid === cat.committed ? 'status-paid' : 'status-pending';
                return `
                  <tr>
                    <td><strong>${cat.name}</strong></td>
                    <td style="text-align: right;">${formatCurrency(cat.planned)}</td>
                    <td style="text-align: right;">${formatCurrency(cat.committed)}</td>
                    <td style="text-align: right;">${formatCurrency(cat.paid)}</td>
                    <td style="text-align: right;">${formatCurrency(cat.pending)}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>

        <div class="section-title">Vendor Payments</div>
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: right;">Paid</th>
              <th style="text-align: right;">Pending</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.categories
              .flatMap((cat) =>
                cat.vendors.map((vendor) => {
                  const statusClass = vendor.status === 'Paid' ? 'status-paid' : vendor.status === 'Overdue' ? 'status-over' : 'status-pending';
                  return `
                    <tr>
                      <td>${vendor.name}</td>
                      <td>${cat.name}</td>
                      <td style="text-align: right;">${formatCurrency(vendor.amount)}</td>
                      <td style="text-align: right;">${formatCurrency(vendor.paid)}</td>
                      <td style="text-align: right;">${formatCurrency(vendor.pending)}</td>
                      <td><span class="status-badge ${statusClass}">${vendor.status}</span></td>
                    </tr>
                  `;
                })
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated by EventKaro - Wedding Management Platform</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    return printContent;
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintablePage());
      printWindow.document.close();
    }
  };

  const handleExport = async (type: 'pdf' | 'csv') => {
    setExportType(type);
    setIsExporting(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (type === 'csv') {
      downloadCSV();
    } else {
      downloadPDF();
    }

    setIsExporting(false);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-rose-300 hover:bg-rose-50 font-medium transition-all"
      >
        <Download className="h-4 w-4" />
        Export Report
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Export Budget Report</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose your preferred format to download the budget report.
              </p>

              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-rose-300 hover:bg-rose-50 transition-all disabled:opacity-50"
              >
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">PDF Report</p>
                  <p className="text-sm text-gray-500">Formatted for printing or sharing</p>
                </div>
                {isExporting && exportType === 'pdf' ? (
                  <Loader2 className="h-5 w-5 text-rose-600 animate-spin" />
                ) : (
                  <Download className="h-5 w-5 text-gray-400" />
                )}
              </button>

              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-rose-300 hover:bg-rose-50 transition-all disabled:opacity-50"
              >
                <div className="p-3 bg-green-100 rounded-lg">
                  <Table className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">CSV Spreadsheet</p>
                  <p className="text-sm text-gray-500">Open in Excel or Google Sheets</p>
                </div>
                {isExporting && exportType === 'csv' ? (
                  <Loader2 className="h-5 w-5 text-rose-600 animate-spin" />
                ) : (
                  <Download className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500 text-center">
                Reports include all categories, vendors, and payment status
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
