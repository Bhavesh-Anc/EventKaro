interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
      <div className="text-red-600 text-lg mb-2">⚠️ {message}</div>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function ErrorPage({ message = "Something went wrong" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <a
          href="/"
          className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
