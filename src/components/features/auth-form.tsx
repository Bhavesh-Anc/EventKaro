'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface AuthFormProps {
  type: 'login' | 'signup';
  action: (formData: FormData) => Promise<{ error?: string }>;
}

export function AuthForm({ type, action }: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success!',
          description: type === 'signup'
            ? 'Account created! Please check your email to confirm.'
            : 'Welcome back!',
        });

        if (type === 'signup') {
          // Redirect to a confirmation page or stay on current page
          toast({
            title: 'Check your email',
            description: 'Click the confirmation link to activate your account',
          });
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6 shadow-sm">
        {type === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="John Doe"
              disabled={isPending}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={type === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={6}
            placeholder="••••••••"
            disabled={isPending}
          />
          {type === 'signup' && (
            <p className="text-xs text-muted-foreground">
              At least 6 characters
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {type === 'signup' ? 'Creating account...' : 'Signing in...'}
            </span>
          ) : (
            type === 'signup' ? 'Sign up' : 'Sign in'
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {type === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        </span>
        <a
          href={type === 'signup' ? '/login' : '/signup'}
          className="font-medium text-primary hover:underline"
        >
          {type === 'signup' ? 'Sign in' : 'Sign up'}
        </a>
      </div>
    </form>
  );
}
