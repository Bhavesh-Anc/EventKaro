'use client';

import { useState } from 'react';
import {
  Wallet,
  Calendar,
  Check,
  Clock,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Receipt,
  Bell,
  Edit2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

interface Installment {
  id: string;
  installment_number: number;
  installment_name: string;
  amount_inr: number;
  percentage: number;
  status: 'pending' | 'due' | 'overdue' | 'paid' | 'partially_paid' | 'cancelled';
  due_date: string;
  paid_date?: string;
  paid_amount_inr: number;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
}

interface VendorPayment {
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  contract_value: number;
  installments: Installment[];
}

interface PaymentInstallmentsProps {
  eventId: string;
  vendorPayments: VendorPayment[];
  onMarkPaid?: (installmentId: string, paymentDetails: any) => Promise<void>;
  onAddInstallment?: (vendorId: string, installmentData: any) => Promise<void>;
  onEditInstallment?: (installmentId: string, data: any) => Promise<void>;
  onDeleteInstallment?: (installmentId: string) => Promise<void>;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'gray', icon: Clock },
  due: { label: 'Due', color: 'amber', icon: Bell },
  overdue: { label: 'Overdue', color: 'red', icon: AlertTriangle },
  paid: { label: 'Paid', color: 'green', icon: Check },
  partially_paid: { label: 'Partial', color: 'blue', icon: CreditCard },
  cancelled: { label: 'Cancelled', color: 'gray', icon: Trash2 },
};

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

export function PaymentInstallments({
  eventId,
  vendorPayments,
  onMarkPaid,
  onAddInstallment,
  onEditInstallment,
  onDeleteInstallment,
}: PaymentInstallmentsProps) {
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    method: 'bank_transfer',
    reference: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const toggleVendor = (vendorId: string) => {
    const newExpanded = new Set(expandedVendors);
    if (newExpanded.has(vendorId)) {
      newExpanded.delete(vendorId);
    } else {
      newExpanded.add(vendorId);
    }
    setExpandedVendors(newExpanded);
  };

  const handleMarkPaid = async (installment: Installment) => {
    if (onMarkPaid) {
      await onMarkPaid(installment.id, {
        amount: parseFloat(paymentDetails.amount) || installment.amount_inr - installment.paid_amount_inr,
        method: paymentDetails.method,
        reference: paymentDetails.reference,
        date: paymentDetails.date,
      });
      setShowPaymentModal(null);
      setPaymentDetails({
        amount: '',
        method: 'bank_transfer',
        reference: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

  // Calculate totals
  const totals = vendorPayments.reduce(
    (acc, vendor) => {
      const vendorTotal = vendor.installments.reduce((sum, inst) => sum + inst.amount_inr, 0);
      const vendorPaid = vendor.installments.reduce((sum, inst) => sum + inst.paid_amount_inr, 0);
      const overdueAmount = vendor.installments
        .filter(inst => inst.status === 'overdue')
        .reduce((sum, inst) => sum + (inst.amount_inr - inst.paid_amount_inr), 0);

      return {
        total: acc.total + vendorTotal,
        paid: acc.paid + vendorPaid,
        pending: acc.pending + (vendorTotal - vendorPaid),
        overdue: acc.overdue + overdueAmount,
      };
    },
    { total: 0, paid: 0, pending: 0, overdue: 0 }
  );

  // Get upcoming payments (next 7 days)
  const upcomingPayments = vendorPayments.flatMap(vendor =>
    vendor.installments
      .filter(inst => {
        if (inst.status === 'paid' || inst.status === 'cancelled') return false;
        const daysUntil = differenceInDays(new Date(inst.due_date), new Date());
        return daysUntil >= 0 && daysUntil <= 7;
      })
      .map(inst => ({ ...inst, vendorName: vendor.vendor_name }))
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totals.total.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Check className="h-4 w-4" />
            <span className="text-sm">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            ₹{totals.paid.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">
            {totals.total > 0 ? Math.round((totals.paid / totals.total) * 100) : 0}% complete
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            ₹{totals.pending.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            ₹{totals.overdue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5" />
            Upcoming Payments (Next 7 Days)
          </h3>
          <div className="space-y-2">
            {upcomingPayments.map(payment => {
              const daysUntil = differenceInDays(new Date(payment.due_date), new Date());
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.vendorName}</p>
                    <p className="text-sm text-gray-600">{payment.installment_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{(payment.amount_inr - payment.paid_amount_inr).toLocaleString('en-IN')}
                    </p>
                    <p className={cn(
                      "text-xs",
                      daysUntil === 0 ? "text-red-600 font-semibold" : "text-amber-600"
                    )}>
                      {daysUntil === 0 ? 'Due Today!' : `Due in ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vendor-wise Payments */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          Vendor Payments
        </h3>

        {vendorPayments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No vendor payments set up yet</p>
            <p className="text-sm text-gray-500">Book vendors to start tracking payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendorPayments.map(vendor => {
              const isExpanded = expandedVendors.has(vendor.vendor_id);
              const totalPaid = vendor.installments.reduce((sum, i) => sum + i.paid_amount_inr, 0);
              const totalAmount = vendor.installments.reduce((sum, i) => sum + i.amount_inr, 0);
              const hasOverdue = vendor.installments.some(i => i.status === 'overdue');
              const nextPayment = vendor.installments.find(
                i => i.status !== 'paid' && i.status !== 'cancelled'
              );

              return (
                <div
                  key={vendor.vendor_id}
                  className={cn(
                    "bg-white rounded-xl border-2 overflow-hidden",
                    hasOverdue ? "border-red-200" : "border-gray-200"
                  )}
                >
                  {/* Vendor Header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleVendor(vendor.vendor_id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{vendor.vendor_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {vendor.vendor_type}
                        </span>
                        {hasOverdue && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {vendor.installments.length} installments • Next:{' '}
                        {nextPayment
                          ? `₹${(nextPayment.amount_inr - nextPayment.paid_amount_inr).toLocaleString('en-IN')} on ${format(new Date(nextPayment.due_date), 'dd MMM')}`
                          : 'All paid'}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="w-32 hidden md:block">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((totalPaid / totalAmount) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${(totalPaid / totalAmount) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">
                        of ₹{totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {/* Installments */}
                  {isExpanded && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                      <div className="space-y-3">
                        {vendor.installments.map(installment => {
                          const StatusIcon = STATUS_CONFIG[installment.status].icon;
                          const statusColor = STATUS_CONFIG[installment.status].color;
                          const remainingAmount = installment.amount_inr - installment.paid_amount_inr;
                          const daysUntil = differenceInDays(new Date(installment.due_date), new Date());

                          return (
                            <div
                              key={installment.id}
                              className={cn(
                                "flex items-center gap-4 p-3 bg-white rounded-lg border",
                                installment.status === 'overdue' && "border-red-200 bg-red-50/50",
                                installment.status === 'paid' && "opacity-75"
                              )}
                            >
                              {/* Status Icon */}
                              <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                statusColor === 'green' && "bg-green-100 text-green-600",
                                statusColor === 'amber' && "bg-amber-100 text-amber-600",
                                statusColor === 'red' && "bg-red-100 text-red-600",
                                statusColor === 'blue' && "bg-blue-100 text-blue-600",
                                statusColor === 'gray' && "bg-gray-100 text-gray-600",
                              )}>
                                <StatusIcon className="h-5 w-5" />
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {installment.installment_name || `Installment ${installment.installment_number}`}
                                  </span>
                                  {installment.percentage && (
                                    <span className="text-xs text-gray-500">
                                      ({installment.percentage}%)
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(installment.due_date), 'dd MMM yyyy')}
                                  </span>
                                  {installment.status !== 'paid' && installment.status !== 'cancelled' && (
                                    <span className={cn(
                                      "text-xs",
                                      daysUntil < 0 && "text-red-600",
                                      daysUntil === 0 && "text-amber-600",
                                      daysUntil > 0 && "text-gray-500"
                                    )}>
                                      {daysUntil < 0
                                        ? `${Math.abs(daysUntil)} days overdue`
                                        : daysUntil === 0
                                        ? 'Due today'
                                        : `${daysUntil} days left`}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ₹{installment.amount_inr.toLocaleString('en-IN')}
                                </p>
                                {installment.paid_amount_inr > 0 && installment.paid_amount_inr < installment.amount_inr && (
                                  <p className="text-xs text-green-600">
                                    ₹{installment.paid_amount_inr.toLocaleString('en-IN')} paid
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              {installment.status !== 'paid' && installment.status !== 'cancelled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPaymentModal(installment.id);
                                    setPaymentDetails(prev => ({
                                      ...prev,
                                      amount: remainingAmount.toString(),
                                    }));
                                  }}
                                  className="shrink-0 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}

                              {installment.status === 'paid' && (
                                <span className="shrink-0 flex items-center gap-1 text-green-600 text-sm">
                                  <Check className="h-4 w-4" />
                                  Paid
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Installment Button */}
                      {onAddInstallment && (
                        <button
                          onClick={() => onAddInstallment(vendor.vendor_id, {})}
                          className="mt-3 flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
                        >
                          <Plus className="h-4 w-4" />
                          Add Installment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Record Payment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentDetails.amount}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentDetails.method}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDetails.date}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference/Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={paymentDetails.reference}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g., UPI123456 or Cheque #1234"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const installment = vendorPayments
                    .flatMap(v => v.installments)
                    .find(i => i.id === showPaymentModal);
                  if (installment) {
                    handleMarkPaid(installment);
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
