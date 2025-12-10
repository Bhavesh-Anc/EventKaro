'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CSVImportFormProps {
  eventId: string;
  importAction: (formData: FormData) => Promise<any>;
}

export function CSVImportForm({ eventId, importAction }: CSVImportFormProps) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_id', eventId);

    startTransition(async () => {
      const res = await importAction(formData);
      setResult(res);
      if (res.success) {
        setTimeout(() => {
          router.push(`/events/${eventId}/guests`);
        }, 2000);
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isPending}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Only CSV files are accepted. Maximum file size: 5MB
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || !file}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Importing...' : 'Import Guests'}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <h4
            className={`font-semibold mb-2 ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {result.success ? 'Import Successful!' : 'Import Failed'}
          </h4>
          {result.success ? (
            <div
              className={`text-sm space-y-1 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              <p>
                Successfully imported <strong>{result.imported}</strong> guests
              </p>
              {result.skipped > 0 && (
                <p>Skipped {result.skipped} duplicate/invalid entries</p>
              )}
              <p className="mt-2">Redirecting to guest list...</p>
            </div>
          ) : (
            <p className="text-sm text-red-800">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
