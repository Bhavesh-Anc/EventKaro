'use client';

import { useState } from 'react';
import { submitGuestRSVP } from '@/actions/planning';
import { ErrorMessage } from '@/components/ui/error-message';

interface GuestData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: string;
  number_of_guests: number;
  guest_names: string[] | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  special_requests: string | null;
  arrival_date: string | null;
  arrival_time: string | null;
  arrival_location: string | null;
  arrival_location_type: string | null;
  arrival_flight_train_number: string | null;
  arrival_needs_pickup: boolean;
  arrival_notes: string | null;
  departure_date: string | null;
  departure_time: string | null;
  departure_location: string | null;
  departure_location_type: string | null;
  departure_flight_train_number: string | null;
  departure_needs_dropoff: boolean;
  departure_notes: string | null;
  needs_accommodation: boolean;
  accommodation_check_in: string | null;
  accommodation_check_out: string | null;
  accommodation_preferences: string | null;
  event: {
    title: string;
    start_date: string;
  };
}

interface Props {
  guest: GuestData;
  invitationToken: string;
}

export default function PublicGuestRSVPForm({ guest, invitationToken }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState(guest.rsvp_status || 'pending');
  const [numberOfGuests, setNumberOfGuests] = useState(guest.number_of_guests || 1);
  const [showArrival, setShowArrival] = useState(!!guest.arrival_date);
  const [showDeparture, setShowDeparture] = useState(!!guest.departure_date);
  const [needsAccommodation, setNeedsAccommodation] = useState(guest.needs_accommodation || false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('invitation_token', invitationToken);

      await submitGuestRSVP(formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setError('Failed to submit RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-600">
            Your RSVP has been submitted successfully. We look forward to seeing you at the event!
          </p>
        </div>
        {rsvpStatus === 'accepted' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Keep an eye out for event updates</li>
              <li>• You can update your details anytime using this link</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            retry={() => {
              setError(null);
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
          />
        </div>
      )}

      {/* RSVP Status */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Will you be attending? *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'accepted', label: 'Yes, I\'ll be there!', color: 'purple' },
            { value: 'declined', label: 'Sorry, can\'t make it', color: 'red' },
            { value: 'maybe', label: 'Not sure yet', color: 'yellow' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                rsvpStatus === option.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="rsvp_status"
                value={option.value}
                checked={rsvpStatus === option.value}
                onChange={(e) => setRsvpStatus(e.target.value)}
                className="sr-only"
                required
              />
              <span className="font-medium text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {rsvpStatus === 'accepted' && (
        <>
          {/* Personal Information */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  defaultValue={guest.first_name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  defaultValue={guest.last_name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={guest.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={guest.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Number of Guests */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Guest Count</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of people attending (including yourself) *
              </label>
              <input
                type="number"
                name="number_of_guests"
                min="1"
                max="10"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            {numberOfGuests > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Names of accompanying guests (comma-separated)
                </label>
                <input
                  type="text"
                  name="guest_names"
                  defaultValue={guest.guest_names?.join(', ') || ''}
                  placeholder="John Doe, Jane Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Special Requirements */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Requirements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Requirements
                </label>
                <textarea
                  name="dietary_requirements"
                  defaultValue={guest.dietary_requirements || ''}
                  rows={2}
                  placeholder="e.g., Vegetarian, Vegan, Allergies, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibility Needs
                </label>
                <textarea
                  name="accessibility_needs"
                  defaultValue={guest.accessibility_needs || ''}
                  rows={2}
                  placeholder="Wheelchair access, mobility assistance, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any Special Requests
                </label>
                <textarea
                  name="special_requests"
                  defaultValue={guest.special_requests || ''}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Arrival Details */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Arrival Details</h3>
              <button
                type="button"
                onClick={() => setShowArrival(!showArrival)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {showArrival ? 'Hide' : 'Add Arrival Details'}
              </button>
            </div>
            {showArrival && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      name="arrival_date"
                      defaultValue={guest.arrival_date || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      name="arrival_time"
                      defaultValue={guest.arrival_time || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Location Type
                    </label>
                    <select
                      name="arrival_location_type"
                      defaultValue={guest.arrival_location_type || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select location type</option>
                      <option value="airport">Airport</option>
                      <option value="railway_station">Railway Station</option>
                      <option value="bus_station">Bus Station</option>
                      <option value="car">By Car</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Location Name
                    </label>
                    <input
                      type="text"
                      name="arrival_location"
                      defaultValue={guest.arrival_location || ''}
                      placeholder="e.g., IGI Airport Delhi, New Delhi Railway Station"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight/Train Number (if applicable)
                  </label>
                  <input
                    type="text"
                    name="arrival_flight_train_number"
                    defaultValue={guest.arrival_flight_train_number || ''}
                    placeholder="e.g., AI 123, 12345 Rajdhani Express"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="arrival_needs_pickup"
                      value="true"
                      defaultChecked={guest.arrival_needs_pickup}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      I need pickup from arrival location
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="arrival_notes"
                    defaultValue={guest.arrival_notes || ''}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Departure Details */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Departure Details</h3>
              <button
                type="button"
                onClick={() => setShowDeparture(!showDeparture)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {showDeparture ? 'Hide' : 'Add Departure Details'}
              </button>
            </div>
            {showDeparture && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      name="departure_date"
                      defaultValue={guest.departure_date || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Time
                    </label>
                    <input
                      type="time"
                      name="departure_time"
                      defaultValue={guest.departure_time || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Location Type
                    </label>
                    <select
                      name="departure_location_type"
                      defaultValue={guest.departure_location_type || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select location type</option>
                      <option value="airport">Airport</option>
                      <option value="railway_station">Railway Station</option>
                      <option value="bus_station">Bus Station</option>
                      <option value="car">By Car</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Location Name
                    </label>
                    <input
                      type="text"
                      name="departure_location"
                      defaultValue={guest.departure_location || ''}
                      placeholder="e.g., IGI Airport Delhi, New Delhi Railway Station"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight/Train Number (if applicable)
                  </label>
                  <input
                    type="text"
                    name="departure_flight_train_number"
                    defaultValue={guest.departure_flight_train_number || ''}
                    placeholder="e.g., AI 456, 12346 Shatabdi Express"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="departure_needs_dropoff"
                      value="true"
                      defaultChecked={guest.departure_needs_dropoff}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      I need drop-off to departure location
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="departure_notes"
                    defaultValue={guest.departure_notes || ''}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accommodation */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Accommodation</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="needs_accommodation"
                  value="true"
                  checked={needsAccommodation}
                  onChange={(e) => setNeedsAccommodation(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  I need accommodation
                </span>
              </label>
            </div>
            {needsAccommodation && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="accommodation_check_in"
                      defaultValue={guest.accommodation_check_in || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="accommodation_check_out"
                      defaultValue={guest.accommodation_check_out || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accommodation Preferences
                  </label>
                  <textarea
                    name="accommodation_preferences"
                    defaultValue={guest.accommodation_preferences || ''}
                    rows={2}
                    placeholder="e.g., Non-smoking room, ground floor, twin beds"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </div>
    </form>
  );
}
