'use client';

import { useState, useTransition } from 'react';
import { X, Users } from 'lucide-react';
import { createFamily } from '@/actions/guests';
import { useRouter } from 'next/navigation';

interface Props {
  eventId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddFamilyModal({ eventId, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('event_id', eventId);

    startTransition(async () => {
      const result = await createFamily(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Users className="h-5 w-5 text-rose-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add Family</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Name *
            </label>
            <input
              type="text"
              name="family_name"
              required
              placeholder="e.g., Sharma Family"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Side *
            </label>
            <select
              name="family_side"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Select side</option>
              <option value="bride">Bride's Side</option>
              <option value="groom">Groom's Side</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Contact Name
            </label>
            <input
              type="text"
              name="primary_contact_name"
              placeholder="e.g., Raj Sharma"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Contact Phone
            </label>
            <input
              type="tel"
              name="primary_contact_phone"
              placeholder="e.g., +91 98765 43210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg font-medium hover:from-rose-800 hover:to-rose-950 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Adding...' : 'Add Family'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
