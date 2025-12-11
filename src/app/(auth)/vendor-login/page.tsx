import { Metadata } from 'next';
import Link from 'next/link';
import { VendorAuthForm } from '@/components/features/vendor-auth-form';

export const metadata: Metadata = {
  title: 'Vendor Login - EventKaro',
  description: 'Sign in to your vendor account',
};

export default function VendorLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vendor Login
            </h1>
            <p className="text-gray-600">
              Welcome back! Sign in to manage your business
            </p>
          </div>

          <VendorAuthForm mode="login" />

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have a vendor account?{' '}
            <Link
              href="/vendor-signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Are you an event organizer?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Organizer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
