import { signup } from '@/actions/auth';
import { AuthForm } from '@/components/features/auth-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start managing events in minutes
          </p>
        </div>

        <AuthForm type="signup" action={signup} />
      </div>
    </div>
  );
}
