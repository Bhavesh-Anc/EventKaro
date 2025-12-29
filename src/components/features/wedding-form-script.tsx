'use client';

import { createEvent } from '@/actions/events';
import { useEffect } from 'react';

export function WeddingFormScript() {
  useEffect(() => {
    const startDateInput = document.getElementById('start_date') as HTMLInputElement;
    const endDateInput = document.getElementById('end_date_hidden') as HTMLInputElement;

    if (startDateInput && endDateInput) {
      const syncDates = () => {
        endDateInput.value = startDateInput.value;
      };

      startDateInput.addEventListener('change', syncDates);
      syncDates(); // Initial sync

      return () => {
        startDateInput.removeEventListener('change', syncDates);
      };
    }
  }, []);

  return null;
}
