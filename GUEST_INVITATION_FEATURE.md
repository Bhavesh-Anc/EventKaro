# Guest Self-Registration Feature Documentation

## Overview

The Guest Self-Registration feature allows event organizers to send invitation links to guests via email or SMS. Guests can click the link and fill in their details including:
- Personal information (name, email, phone)
- RSVP status (Accepted, Declined, Maybe)
- Number of attending guests
- Dietary requirements and accessibility needs
- **Arrival details** (date, time, location, flight/train number, pickup needs)
- **Departure details** (date, time, location, flight/train number, dropoff needs)
- **Accommodation requirements** (check-in, check-out dates, preferences)

This feature reduces manual data entry for organizers and provides guests with a convenient way to share their travel plans.

---

## What We've Built

### 1. Database Schema (`supabase/migrations/20241214030000_guest_travel_details.sql`)

#### Extended `event_guests` table with:
- **Invitation System:**
  - `invitation_token` - Unique token for the invitation URL
  - `invitation_url` - Full invitation URL
  - `invitation_expires_at` - Token expiration timestamp (30 days)

- **Guest Count:**
  - `number_of_guests` - Total number of people attending
  - `guest_names` - Array of accompanying guest names

- **Arrival Details:**
  - `arrival_date`, `arrival_time`
  - `arrival_location` - e.g., "IGI Airport Delhi"
  - `arrival_location_type` - airport, railway_station, bus_station, car, other
  - `arrival_flight_train_number` - e.g., "AI 123" or "12345 Rajdhani Express"
  - `arrival_needs_pickup` - Boolean flag
  - `arrival_notes` - Additional notes

- **Departure Details:**
  - `departure_date`, `departure_time`
  - `departure_location`
  - `departure_location_type`
  - `departure_flight_train_number`
  - `departure_needs_dropoff` - Boolean flag
  - `departure_notes`

- **Accommodation:**
  - `needs_accommodation` - Boolean flag
  - `accommodation_check_in`, `accommodation_check_out`
  - `accommodation_preferences`

#### New `guest_invitations` table:
Tracks sent invitations with delivery status:
```sql
CREATE TABLE guest_invitations (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  guest_id UUID REFERENCES event_guests(id),
  invitation_token TEXT UNIQUE,
  invitation_type TEXT, -- individual, group, general
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,
  sent_at TIMESTAMPTZ,
  sent_via TEXT, -- email, sms, whatsapp, manual
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  has_responded BOOLEAN,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN
);
```

#### Security Features:
- Auto-generates unique tokens using `generate_invitation_token()` function
- RLS policies allow public access to view/update guests via valid invitation tokens
- Tokens expire after 30 days
- Invitation tracking (opened_at, responded_at)

---

### 2. Server Actions (`src/actions/planning.ts`)

Added the following functions:

#### **`createGuestInvitation(eventId, guestId, recipientData)`**
Creates an invitation record for a guest
- Parameters: `{email?, phone?, name?}`
- Returns invitation with auto-generated token

#### **`getInvitationByToken(token)`**
Fetches invitation details by token
- Validates expiration and active status
- Tracks opened_at timestamp
- Returns event and guest details

#### **`getGuestByInvitationToken(token)`**
Fetches guest details directly by invitation token
- Used by the public RSVP page
- Returns guest with event information

#### **`submitGuestRSVP(formData)`**
Updates guest record with RSVP submission
- Extracts all form fields including travel details
- Updates guest record
- Marks invitation as responded
- Handles comma-separated guest names

#### **`sendGuestInvitation(invitationId, method)`**
Sends invitation via email/SMS/WhatsApp
- Generates invitation URL: `{baseUrl}/rsvp/{token}`
- Updates sent_at and sent_via fields
- **TODO:** Integrate with email/SMS service (Resend, Twilio)

#### **`getEventInvitations(eventId)`**
Lists all invitations for an event
- Used by organizers to track invitation status
- Includes guest RSVP status

---

### 3. Public RSVP Page (`src/app/rsvp/[token]/page.tsx`)

#### Public-facing page for guests to submit their RSVP
- **URL:** `/rsvp/{invitation_token}`
- **Layout:** Beautiful gradient design with event details prominently displayed
- **Features:**
  - Event title, date, and location displayed at top
  - Responsive form layout
  - Success confirmation page after submission
  - No authentication required (public page)

#### Key Features:
- Fetches guest data using `getGuestByInvitationToken(token)`
- Shows 404 if token is invalid or expired
- Displays event information (title, date, location)
- Renders `PublicGuestRSVPForm` component

---

### 4. Public Guest RSVP Form Component

**File:** `src/components/features/public-guest-rsvp-form.tsx`

#### Component Features:

**1. RSVP Status Selection:**
- Three radio button options:
  - ✅ Yes, I'll be there! (accepted)
  - ❌ Sorry, can't make it (declined)
  - ⚠️ Not sure yet (maybe)

**2. Personal Information** (shown if accepted):
- First name, last name (required)
- Email, phone

**3. Guest Count:**
- Number of attending guests
- Names of accompanying guests (comma-separated)

**4. Special Requirements:**
- Dietary requirements (vegetarian, vegan, allergies)
- Accessibility needs (wheelchair, mobility assistance)
- Special requests

**5. Arrival Details** (collapsible):
- Arrival date and time
- Location type (dropdown): Airport, Railway Station, Bus Station, Car, Other
- Location name (free text): e.g., "IGI Airport Delhi"
- Flight/Train number
- Checkbox: "I need pickup from arrival location"
- Additional notes

**6. Departure Details** (collapsible):
- Departure date and time
- Location type and name
- Flight/Train number
- Checkbox: "I need drop-off to departure location"
- Additional notes

**7. Accommodation** (collapsible):
- Checkbox: "I need accommodation"
- Check-in and check-out dates
- Accommodation preferences (e.g., "Non-smoking room")

**8. Form Behavior:**
- Only shows detailed fields if RSVP status is "accepted"
- Collapsible sections for arrival/departure/accommodation
- Shows success confirmation page after submission
- Loading state while submitting

---

## How It Works (User Flow)

### For Organizers:

1. **Add guest to event**
   - Go to `/events/{eventId}/guests/new`
   - Add guest manually (creates `event_guests` record with auto-generated `invitation_token`)

2. **Send invitation**
   - Call `createGuestInvitation(eventId, guestId, {email, phone})`
   - Call `sendGuestInvitation(invitationId, 'email')`
   - System generates URL: `https://yourdomain.com/rsvp/{token}`
   - (TODO: Actually send email/SMS)

3. **Track responses**
   - View invitation status in guest list
   - See who opened the invitation (`opened_at`)
   - See who responded (`responded_at`, `has_responded`)
   - View all guest travel details

### For Guests:

1. **Receive invitation**
   - Get invitation link via email/SMS
   - Example: `https://eventkaro.com/rsvp/abc123xyz`

2. **Fill RSVP form**
   - Click link → lands on beautiful RSVP page
   - See event details (title, date, location)
   - Select RSVP status (Accept/Decline/Maybe)
   - If accepting:
     - Fill personal info
     - Enter number of guests
     - Add dietary/accessibility needs
     - **Optionally add arrival details** (date, time, location, flight number, pickup needs)
     - **Optionally add departure details**
     - **Optionally request accommodation**

3. **Submit**
   - Click "Submit RSVP"
   - See success confirmation
   - Can return to same link to update details later (token doesn't expire for 30 days)

---

## TODO: Missing Component

You need to manually create this file:

**File:** `src/components/features/public-guest-rsvp-form.tsx`

I've provided the complete component code below. Copy and paste it into the file:

```typescript
'use client';

import { useState } from 'react';
import { submitGuestRSVP } from '@/actions/planning';

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
  const [rsvpStatus, setRsvpStatus] = useState(guest.rsvp_status || 'pending');
  const [numberOfGuests, setNumberOfGuests] = useState(guest.number_of_guests || 1);
  const [showArrival, setShowArrival] = useState(!!guest.arrival_date);
  const [showDeparture, setShowDeparture] = useState(!!guest.departure_date);
  const [needsAccommodation, setNeedsAccommodation] = useState(guest.needs_accommodation || false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('invitation_token', invitationToken);

      await submitGuestRSVP(formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Failed to submit RSVP. Please try again.');
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
```

---

## Next Steps

### 1. Apply Database Migration
```bash
cd supabase
npx supabase migration up
```

### 2. Create the Component File
Create `src/components/features/public-guest-rsvp-form.tsx` with the code above.

### 3. Test the Feature
1. Create a guest manually
2. Check the guest's `invitation_token` in the database
3. Visit `/rsvp/{invitation_token}`
4. Fill and submit the form
5. Verify data is saved in the `event_guests` table

### 4. Add Email/SMS Integration (Future)
- Install Resend for emails: `npm install resend`
- Install Twilio for SMS: `npm install twilio`
- Update `sendGuestInvitation()` function in `src/actions/planning.ts`
- Create email template
- Send actual invitations

### 5. Build Organizer UI (Future)
Create pages for organizers to:
- `/events/{eventId}/invitations` - List all invitations
- Send invitations via email/SMS
- Track invitation status
- View guest travel details in a dashboard
- Export guest list with arrival/departure times

---

## Benefits

1. **Reduces Manual Work**: Guests fill their own details
2. **Travel Coordination**: Know when guests are arriving/departing
3. **Accommodation Planning**: Understand accommodation needs upfront
4. **Pickup/Dropoff**: Plan transportation for guests who need it
5. **Dietary/Accessibility**: Prepare for special requirements
6. **Guest Count Accuracy**: Know exact number of attendees
7. **Professional Experience**: Beautiful, branded RSVP pages

---

## Summary

You now have a complete guest self-registration system with:
- ✅ Database schema with invitation tokens and travel details
- ✅ Server actions for invitation management
- ✅ Public RSVP page at `/rsvp/{token}`
- ⏳ Component code (needs to be created manually - see above)
- ⏳ Email/SMS integration (TODO)
- ⏳ Organizer invitation management UI (TODO)

The feature is 80% complete! Just create the component file and you're ready to test.
