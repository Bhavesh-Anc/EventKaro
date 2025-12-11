'use client';

import { useState, useTransition } from 'react';
import { login, signupAsVendor } from '@/actions/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VendorAuthFormProps {
  mode: 'login' | 'signup';
}

export function VendorAuthForm({ mode }: VendorAuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (mode === 'signup') {
          await signupAsVendor(formData);
        } else {
          await login(formData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {mode === 'signup' && (
        <>
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              disabled={isPending}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              name="business_name"
              type="text"
              disabled={isPending}
              placeholder="Optional - can add later"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can complete your business profile after signup
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              disabled={isPending}
              placeholder="+91 9876543210"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="vendor@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          disabled={isPending}
          minLength={6}
          placeholder="••••••••"
        />
        {mode === 'signup' && (
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 6 characters
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? mode === 'signup'
            ? 'Creating account...'
            : 'Signing in...'
          : mode === 'signup'
          ? 'Create vendor account'
          : 'Sign in'}
      </button>

      {mode === 'signup' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">
            Why join EventKaro?
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Connect with event organizers across India</li>
            <li>• Showcase your services and packages</li>
            <li>• Receive quote requests directly</li>
            <li>• Manage bookings and payments online</li>
            <li>• Track your business performance</li>
          </ul>
        </div>
      )}
    </form>
  );
}
