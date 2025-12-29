import { signup } from '@/actions/auth';
import { AuthForm } from '@/components/features/auth-form';
import { Heart, Sparkles } from 'lucide-react';

export default function SignupPage() {
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
            Start Planning Your Dream Wedding
          </h2>
          <p className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Create your free account in minutes
          </p>
        </div>

        <AuthForm type="signup" action={signup} />

        {/* Vendor Signup Link */}
        <div className="text-center p-4 rounded-lg bg-gray-100 border border-gray-200">
          <p className="text-sm text-gray-700">
            Are you a vendor?{' '}
            <a href="/vendors/register" className="font-semibold text-rose-700 hover:text-rose-800 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
