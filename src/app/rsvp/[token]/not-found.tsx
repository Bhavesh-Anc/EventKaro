export default function RSVPNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😞</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
        <p className="text-gray-600 mb-6">
          This invitation link appears to be invalid or expired. Please contact the event organizer for a new invitation.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-left">
          <p className="font-semibold text-yellow-900 mb-2">Possible reasons:</p>
          <ul className="text-yellow-800 space-y-1 list-disc list-inside">
            <li>The invitation link has expired (valid for 30 days)</li>
            <li>The invitation was cancelled by the organizer</li>
            <li>The link was copied incorrectly</li>
            <li>Database migration not yet applied</li>
          </ul>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Powered by EventKaro</p>
        </div>
      </div>
    </div>
  );
}
