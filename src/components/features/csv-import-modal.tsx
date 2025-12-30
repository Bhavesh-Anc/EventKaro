'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { importFamiliesFromCSV } from '@/actions/guests';

interface Props {
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * CSV IMPORT MODAL
 *
 * Imports families and their members from a CSV file
 *
 * CSV Format:
 * family_name, family_side, primary_contact_name, primary_contact_phone,
 * member_name, member_age, is_elderly, is_child, is_vip, dietary_restrictions,
 * is_outstation, rooms_required, pickup_required
 */
export function CSVImportModal({ eventId, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported?: number;
    skipped?: number;
    error?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('event_id', eventId);

      const response = await importFamiliesFromCSV(formData);

      setResult(response);

      if (response.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to import CSV',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `family_name,family_side,primary_contact_name,primary_contact_phone,member_name,member_age,is_elderly,is_child,is_vip,dietary_restrictions,is_outstation,rooms_required,pickup_required
Sharma Family,bride,Raj Sharma,+919876543210,Raj Sharma,55,false,false,true,,true,2,true
Sharma Family,bride,Raj Sharma,+919876543210,Priya Sharma,52,false,false,false,Vegetarian,true,2,true
Sharma Family,bride,Raj Sharma,+919876543210,Amit Sharma,25,false,false,false,,true,2,true
Kumar Family,groom,Suresh Kumar,+919123456789,Suresh Kumar,60,true,false,true,,true,1,true
Kumar Family,groom,Suresh Kumar,+919123456789,Meena Kumar,58,true,false,false,Jain,true,1,true`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Families from CSV</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload a CSV file to bulk import families and their members
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  First time importing?
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Download our template CSV to see the required format and example data
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Template CSV
                </button>
              </div>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">CSV Format</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Required columns:</strong> family_name, family_side, member_name</p>
              <p><strong>Optional columns:</strong> primary_contact_name, primary_contact_phone, member_age, is_elderly, is_child, is_vip, dietary_restrictions, is_outstation, rooms_required, pickup_required</p>
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: Multiple rows with the same family_name will be grouped as one family
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!file ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-rose-400 hover:bg-rose-50 transition-all text-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  Click to upload CSV file
                </div>
                <div className="text-sm text-gray-600">
                  or drag and drop your file here
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Maximum file size: 5MB
                </div>
              </button>
            ) : (
              <div className="rounded-xl border-2 border-green-300 bg-green-50 p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Result */}
          {result && (
            <div
              className={`rounded-lg border-2 p-4 ${
                result.success
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.success ? 'Import Successful!' : 'Import Failed'}
                  </div>
                  <div
                    className={`text-sm ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {result.success ? (
                      <>
                        Imported {result.imported} families successfully
                        {result.skipped! > 0 && ` (${result.skipped} rows skipped)`}
                      </>
                    ) : (
                      result.error
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import Families'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
