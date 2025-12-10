import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          EventKaro
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          India's Premier Event Management Platform
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Create Events</h3>
            <p className="text-sm text-muted-foreground">
              Manage conferences, weddings, concerts, and more
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Sell Tickets</h3>
            <p className="text-sm text-muted-foreground">
              Integrated Razorpay payments with UPI support
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Track Attendance</h3>
            <p className="text-sm text-muted-foreground">
              QR code check-in with offline mobile support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
