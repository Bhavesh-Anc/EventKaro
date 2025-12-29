'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CustomEvent {
  id: number;
  name: string;
  description: string;
}

export function CustomEventsManager() {
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [nextId, setNextId] = useState(1);

  const addCustomEvent = () => {
    setCustomEvents([...customEvents, { id: nextId, name: '', description: '' }]);
    setNextId(nextId + 1);
  };

  const removeCustomEvent = (id: number) => {
    setCustomEvents(customEvents.filter((e) => e.id !== id));
  };

  const updateCustomEvent = (id: number, field: 'name' | 'description', value: string) => {
    setCustomEvents(
      customEvents.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Custom Events</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add any other ceremonies or events specific to your wedding
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {customEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-4 rounded-lg border-2 border-amber-300 bg-white"
          >
            <div className="flex-1 space-y-3">
              <input
                type="text"
                name="custom_event_names"
                placeholder="Event name (e.g., Tilak, Chooda, Griha Pravesh)"
                required
                value={event.name}
                onChange={(e) => updateCustomEvent(event.id, 'name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <textarea
                name="custom_event_descriptions"
                placeholder="Brief description (optional)"
                rows={2}
                value={event.description}
                onChange={(e) => updateCustomEvent(event.id, 'description', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button
              type="button"
              onClick={() => removeCustomEvent(event.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCustomEvent}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-amber-300 bg-white hover:bg-amber-50 text-gray-700 font-semibold transition-all"
      >
        <Plus className="h-4 w-4" />
        Add Custom Event
      </button>
    </div>
  );
}
