import { login } from '@/actions/auth';
import { AuthForm } from '@/components/features/auth-form';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 shadow-lg">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent">
            Welcome Back to EventKaro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue planning your dream wedding
          </p>
        </div>

        <AuthForm type="login" action={login} />

        {/* Vendor Login Link */}
        <div className="text-center p-4 rounded-lg bg-gray-100 border border-gray-200">
          <p className="text-sm text-gray-700">
            Are you a vendor?{' '}
            <a href="/vendor/login" className="font-semibold text-rose-700 hover:text-rose-800 hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
