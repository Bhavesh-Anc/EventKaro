'use client';

import { createEvent } from '@/actions/events';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function WeddingFormWrapper({
  children,
  organizationId,
}: {
  children: React.ReactNode;
  organizationId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const form = document.getElementById('wedding-form') as HTMLFormElement;
    if (!form) return;

    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      setIsSubmitting(true);

      const formData = new FormData(form);

      // Sync end_date with start_date
      const startDate = formData.get('start_date');
      if (startDate) {
        formData.set('end_date', startDate as string);
      }

      try {
        await createEvent(formData);
      } catch (error) {
        console.error('Error creating wedding:', error);
        setIsSubmitting(false);
      }
    };

    form.addEventListener('submit', handleSubmit);

    return () => {
      form.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return (
    <form className="space-y-6" id="wedding-form">
      <input type="hidden" name="organization_id" value={organizationId} />
      <input type="hidden" name="event_type" value="wedding" />
      <input type="hidden" name="venue_type" value="physical" />
      <input type="hidden" name="is_free" value="on" />
      {children}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 px-6 py-3 text-base font-semibold text-white hover:from-rose-800 hover:to-rose-950 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Creating Wedding...' : 'Create Wedding Event'}
      </button>
    </form>
  );
}
