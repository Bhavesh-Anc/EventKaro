'use client';

import { useState, useTransition, useEffect } from 'react';
import { createQuoteRequest } from '@/actions/vendors';
import { getUserEvents } from '@/actions/events';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}

export function QuoteRequestModal({
  isOpen,
  onClose,
  vendorId,
  vendorName,
}: QuoteRequestModalProps) {
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setLoading(true);
      setSelectedEvent(null);

      // Load user's events
      getUserEvents().then((userEvents) => {
        setEvents(userEvents);
        setLoading(false);
      }).catch((error) => {
        console.error('Error loading events:', error);
        setEvents([]);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = e.target.value;
    const event = events.find(ev => ev.id === eventId);
    setSelectedEvent(event);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createQuoteRequest(formData);
        // If we get here without redirect, show success
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } catch (error) {
        // Redirect happened or error occurred
        console.error('Quote request error:', error);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Request Quote</h2>
              <p className="text-muted-foreground">{vendorName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <input type="hidden" name="vendor_id" value={vendorId} />

          {success ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
              <p className="text-green-800 font-semibold text-lg">✓ Quote Request Sent!</p>
              <p className="text-green-700 text-sm mt-2">
                The vendor will respond to your request soon.
              </p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="event_id">Select Event *</Label>
                {loading ? (
                  <div className="w-full rounded-md border px-3 py-2 text-sm text-muted-foreground">
                    Loading events...
                  </div>
                ) : events.length === 0 ? (
                  <div>
                    <div className="w-full rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                      You don't have any events yet. Create an event first to request quotes.
                    </div>
                    <Link
                      href="/events/new"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      → Create your first event
                    </Link>
                  </div>
                ) : (
                  <>
                    <select
                      id="event_id"
                      name="event_id"
                      required
                      disabled={isPending}
                      onChange={handleEventChange}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Choose an event...</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {new Date(event.start_date).toLocaleDateString()} - {event.venue_city || 'TBD'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select which event you need this vendor for
                    </p>
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="service_type">Service Type *</Label>
                <Input
                  id="service_type"
                  name="service_type"
                  type="text"
                  required
                  disabled={isPending || events.length === 0}
                  placeholder="e.g., Photography, Catering, Decoration"
                />
              </div>

              <div>
                <Label htmlFor="event_date">Event Date *</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  required
                  disabled={isPending || events.length === 0}
                  value={selectedEvent ? selectedEvent.start_date : ''}
                  readOnly={!!selectedEvent}
                />
                {selectedEvent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-filled from selected event
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guest_count">Number of Guests</Label>
                  <Input
                    id="guest_count"
                    name="guest_count"
                    type="number"
                    disabled={isPending || events.length === 0}
                    placeholder={selectedEvent?.capacity || "100"}
                    defaultValue={selectedEvent?.capacity || ""}
                  />
                  {selectedEvent?.capacity && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Event capacity: {selectedEvent.capacity}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="budget_range">Budget Range</Label>
                  <select
                    id="budget_range"
                    name="budget_range"
                    disabled={isPending || events.length === 0}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select range...</option>
                    <option value="under_50k">Under ₹50,000</option>
                    <option value="50k_1l">₹50,000 - ₹1,00,000</option>
                    <option value="1l_2l">₹1,00,000 - ₹2,00,000</option>
                    <option value="2l_5l">₹2,00,000 - ₹5,00,000</option>
                    <option value="above_5l">Above ₹5,00,000</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="venue_location">Venue Location</Label>
                <Input
                  id="venue_location"
                  name="venue_location"
                  type="text"
                  disabled={isPending || events.length === 0}
                  placeholder="City or venue name"
                  value={selectedEvent ? `${selectedEvent.venue_name || ''} ${selectedEvent.venue_city || ''}`.trim() : ''}
                  readOnly={!!selectedEvent}
                />
                {selectedEvent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-filled from selected event
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="message">Message / Requirements</Label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  disabled={isPending || events.length === 0}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell the vendor about your specific requirements, preferences, or any questions you have..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending || events.length === 0}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Sending...' : 'Send Quote Request'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
