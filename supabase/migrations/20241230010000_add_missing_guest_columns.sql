-- Add missing columns to guests table
-- These columns are used by the RSVP form but were missing from the schema

ALTER TABLE guests
-- RSVP fields (update status values)
ADD COLUMN IF NOT EXISTS rsvp_responded_at TIMESTAMPTZ,

-- Number of guests attending
ADD COLUMN IF NOT EXISTS number_of_guests INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS guest_names TEXT[], -- Array of accompanying guest names

-- Special Requirements
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT,
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT,
ADD COLUMN IF NOT EXISTS special_requests TEXT,

-- Arrival Details
ADD COLUMN IF NOT EXISTS arrival_date DATE,
ADD COLUMN IF NOT EXISTS arrival_time TIME,
ADD COLUMN IF NOT EXISTS arrival_location TEXT,
ADD COLUMN IF NOT EXISTS arrival_location_type TEXT CHECK (arrival_location_type IN ('airport', 'railway_station', 'bus_station', 'car', 'other')),
ADD COLUMN IF NOT EXISTS arrival_flight_train_number TEXT,
ADD COLUMN IF NOT EXISTS arrival_needs_pickup BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS arrival_notes TEXT,

-- Departure Details
ADD COLUMN IF NOT EXISTS departure_date DATE,
ADD COLUMN IF NOT EXISTS departure_time TIME,
ADD COLUMN IF NOT EXISTS departure_location TEXT,
ADD COLUMN IF NOT EXISTS departure_location_type TEXT CHECK (departure_location_type IN ('airport', 'railway_station', 'bus_station', 'car', 'other')),
ADD COLUMN IF NOT EXISTS departure_flight_train_number TEXT,
ADD COLUMN IF NOT EXISTS departure_needs_dropoff BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS departure_notes TEXT,

-- Accommodation
ADD COLUMN IF NOT EXISTS needs_accommodation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accommodation_check_in DATE,
ADD COLUMN IF NOT EXISTS accommodation_check_out DATE,
ADD COLUMN IF NOT EXISTS accommodation_preferences TEXT;

-- Update rsvp_status constraint to match the values used in the code
ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_rsvp_status_check;
ALTER TABLE guests ADD CONSTRAINT guests_rsvp_status_check
  CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'maybe', 'no_response'));

-- Add comments
COMMENT ON COLUMN guests.number_of_guests IS 'Total number of people attending (including the guest)';
COMMENT ON COLUMN guests.dietary_requirements IS 'Dietary restrictions and preferences';
COMMENT ON COLUMN guests.accessibility_needs IS 'Accessibility requirements (wheelchair, mobility assistance, etc.)';
COMMENT ON COLUMN guests.special_requests IS 'Any other special requests';
COMMENT ON COLUMN guests.arrival_location IS 'Where the guest is arriving (e.g., IGI Airport Delhi)';
COMMENT ON COLUMN guests.needs_accommodation IS 'Whether the guest needs accommodation arranged';
