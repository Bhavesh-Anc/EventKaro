import { Metadata } from 'next';
import Link from 'next/link';
import { VendorAuthForm } from '@/components/features/vendor-auth-form';

export const metadata: Metadata = {
  title: 'Vendor Signup - EventKaro',
  description: 'Join EventKaro as a vendor and grow your business',
};

export default function VendorSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join as a Vendor
            </h1>
            <p className="text-gray-600">
              Grow your event business with EventKaro
            </p>
          </div>

          <VendorAuthForm mode="signup" />

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have a vendor account?{' '}
            <Link
              href="/vendor-login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Are you an event organizer?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign up here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
