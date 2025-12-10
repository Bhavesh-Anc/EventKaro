import { getEvent } from '@/actions/events';
import { importGuestsFromCSV } from '@/actions/guests';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CSVImportForm } from '@/components/features/csv-import-form';

export default async function ImportGuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href={`/events/${eventId}/guests`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Guest List
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Import Guests</h2>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          CSV Import Instructions
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Download the template below to get started</li>
          <li>Fill in guest information following the template format</li>
          <li>Required column: <strong>first_name</strong></li>
          <li>
            Optional columns: last_name, email, phone, group_name, plus_one_allowed
          </li>
          <li>Save your file as CSV (comma-separated values)</li>
          <li>Upload the file below to import guests</li>
        </ul>
      </div>

      {/* Download Template */}
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold mb-3">Step 1: Download Template</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Download the CSV template to ensure your data is formatted correctly.
        </p>
        <Link
          href={`/api/guests/template?eventId=${eventId}`}
          download="guest-import-template.csv"
          className="inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Download CSV Template
        </Link>
      </div>

      {/* Upload CSV */}
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold mb-3">Step 2: Upload Your CSV File</h3>
        <CSVImportForm eventId={eventId} importAction={importGuestsFromCSV} />
      </div>

      {/* Format Example */}
      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">CSV Format Example</h3>
        <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
{`first_name,last_name,email,phone,group_name,plus_one_allowed
John,Doe,john@example.com,+91 98765 43210,Family,true
Jane,Smith,jane@example.com,+91 98765 43211,Friends,false
Bob,Johnson,bob@example.com,,Colleagues,true`}
        </pre>
      </div>

      {/* Tips */}
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold mb-2">Tips for Best Results</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Remove any empty rows from your CSV file</li>
          <li>• Use TRUE/FALSE or 1/0 for plus_one_allowed column</li>
          <li>• Group names will be auto-created if they don't exist</li>
          <li>• Email addresses will be validated</li>
          <li>• Duplicate entries (same email) will be skipped</li>
        </ul>
      </div>
    </div>
  );
}
