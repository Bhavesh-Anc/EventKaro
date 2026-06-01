export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📴</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Don't worry — your data is safe.
          We'll sync everything once you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-rose-700 text-white rounded-lg font-medium hover:bg-rose-800 transition-colors"
        >
          Try Again
        </button>
        <p className="text-sm text-gray-500 mt-6">
          Tip: Key pages like Timeline and Guests are cached for offline access.
        </p>
      </div>
    </div>
  );
}
