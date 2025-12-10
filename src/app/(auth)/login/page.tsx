import { login } from '@/actions/auth';
import { AuthForm } from '@/components/features/auth-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign in to EventKaro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your events with ease
          </p>
        </div>

        <AuthForm type="login" action={login} />
      </div>
    </div>
  );
}
