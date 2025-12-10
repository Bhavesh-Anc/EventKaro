'use client';

import { useTransition, useState } from 'react';
import { Label } from '@/components/ui/label';

interface GuestDietaryFormProps {
  guestId: string;
  eventId: string;
  currentPreferences: Array<{ preference: string; notes?: string }>;
  addAction: (guestId: string, preference: string, notes?: string) => Promise<any>;
  removeAction: (guestId: string, preference: string, eventId: string) => Promise<any>;
}

const dietaryOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'lactose_free', label: 'Lactose-Free' },
  { value: 'nut_allergy', label: 'Nut Allergy' },
  { value: 'other', label: 'Other' },
];

export function GuestDietaryForm({
  guestId,
  eventId,
  currentPreferences,
  addAction,
  removeAction,
}: GuestDietaryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPreference, setSelectedPreference] = useState('');
  const [notes, setNotes] = useState('');

  const currentPreferenceValues = currentPreferences.map((p) => p.preference);

  const handleAdd = () => {
    if (!selectedPreference) return;

    startTransition(async () => {
      await addAction(guestId, selectedPreference, notes || undefined);
      setSelectedPreference('');
      setNotes('');
    });
  };

  const handleRemove = (preference: string) => {
    startTransition(async () => {
      await removeAction(guestId, preference, eventId);
    });
  };

  const availableOptions = dietaryOptions.filter(
    (opt) => !currentPreferenceValues.includes(opt.value)
  );

  return (
    <div className="space-y-4">
      {/* Current Preferences */}
      {currentPreferences.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Current preferences:</p>
          <div className="flex flex-wrap gap-2">
            {currentPreferences.map((pref) => (
              <div
                key={pref.preference}
                className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800"
              >
                <span>{pref.preference.replace('_', ' ')}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(pref.preference)}
                  disabled={isPending}
                  className="hover:text-orange-900 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No dietary preferences added yet.
        </p>
      )}

      {/* Add New Preference */}
      {availableOptions.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Add dietary preference:</p>

          <div>
            <Label htmlFor="preference">Preference</Label>
            <select
              id="preference"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedPreference}
              onChange={(e) => setSelectedPreference(e.target.value)}
              disabled={isPending}
            >
              <option value="">Select a preference</option>
              {availableOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <input
              id="notes"
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder="E.g., Severe allergy, specific requirements..."
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !selectedPreference}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Adding...' : 'Add Preference'}
          </button>
        </div>
      )}
    </div>
  );
}
