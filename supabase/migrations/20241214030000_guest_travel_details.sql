-- Guest Travel and Arrival/Departure Details
-- Extends event_guests table with travel information

-- ============================================
-- EXTEND EVENT GUESTS TABLE
-- ============================================

ALTER TABLE event_guests
-- Invitation System
ADD COLUMN invitation_token TEXT UNIQUE,
ADD COLUMN invitation_url TEXT,
ADD COLUMN invitation_expires_at TIMESTAMPTZ,

-- Number of Attendees
ADD COLUMN number_of_guests INTEGER DEFAULT 1,
ADD COLUMN guest_names TEXT[], -- Array of accompanying guest names

-- Arrival Details
ADD COLUMN arrival_date DATE,
ADD COLUMN arrival_time TIME,
ADD COLUMN arrival_location TEXT, -- airport, railway station, bus station, etc.
ADD COLUMN arrival_location_type TEXT CHECK (arrival_location_type IN ('airport', 'railway_station', 'bus_station', 'car', 'other')),
ADD COLUMN arrival_flight_train_number TEXT,
ADD COLUMN arrival_needs_pickup BOOLEAN DEFAULT FALSE,
ADD COLUMN arrival_notes TEXT,

-- Departure Details
ADD COLUMN departure_date DATE,
ADD COLUMN departure_time TIME,
ADD COLUMN departure_location TEXT,
ADD COLUMN departure_location_type TEXT CHECK (departure_location_type IN ('airport', 'railway_station', 'bus_station', 'car', 'other')),
ADD COLUMN departure_flight_train_number TEXT,
ADD COLUMN departure_needs_dropoff BOOLEAN DEFAULT FALSE,
ADD COLUMN departure_notes TEXT,

-- Accommodation
ADD COLUMN needs_accommodation BOOLEAN DEFAULT FALSE,
ADD COLUMN accommodation_check_in DATE,
ADD COLUMN accommodation_check_out DATE,
ADD COLUMN accommodation_preferences TEXT;

-- ============================================
-- FUNCTION TO GENERATE INVITATION TOKEN
-- ============================================

CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 32-character token
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM event_guests WHERE invitation_token = token) INTO exists;

    -- Exit loop if token is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER TO AUTO-GENERATE INVITATION TOKEN
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate token if not provided
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := generate_invitation_token();
    -- Set expiration to 30 days from now
    NEW.invitation_expires_at := NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_invitation_token
  BEFORE INSERT ON event_guests
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invitation_token();

-- ============================================
-- GUEST INVITATIONS TABLE
-- ============================================

CREATE TABLE guest_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES event_guests(id) ON DELETE SET NULL,

  -- Invitation Details
  invitation_token TEXT UNIQUE NOT NULL DEFAULT generate_invitation_token(),
  invitation_type TEXT CHECK (invitation_type IN ('individual', 'group', 'general')) DEFAULT 'individual',

  -- Recipient Info (for tracking sent invitations)
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,

  -- Status
  sent_at TIMESTAMPTZ,
  sent_via TEXT CHECK (sent_via IN ('email', 'sms', 'whatsapp', 'manual')),
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  -- Response
  has_responded BOOLEAN DEFAULT FALSE,

  -- Expiration
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_event_guests_invitation_token ON event_guests(invitation_token);
CREATE INDEX idx_guest_invitations_event ON guest_invitations(event_id);
CREATE INDEX idx_guest_invitations_guest ON guest_invitations(guest_id);
CREATE INDEX idx_guest_invitations_token ON guest_invitations(invitation_token);
CREATE INDEX idx_guest_invitations_status ON guest_invitations(has_responded);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE guest_invitations ENABLE ROW LEVEL SECURITY;

-- Public can view invitations by token (for RSVP form)
CREATE POLICY "Anyone can view invitation by token"
  ON guest_invitations FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND expires_at > NOW());

-- Event organizers can manage invitations
CREATE POLICY "Event organizers can manage invitations"
  ON guest_invitations FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Public can view guest details by invitation token (for RSVP form)
CREATE POLICY "Anyone can view guest by invitation token"
  ON event_guests FOR SELECT
  TO anon, authenticated
  USING (invitation_token IS NOT NULL AND invitation_expires_at > NOW());

-- Public can update guest details via invitation token (for RSVP submission)
CREATE POLICY "Anyone can update guest via invitation token"
  ON event_guests FOR UPDATE
  TO anon, authenticated
  USING (invitation_token IS NOT NULL AND invitation_expires_at > NOW());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN event_guests.invitation_token IS 'Unique token for guest self-registration URL';
COMMENT ON COLUMN event_guests.number_of_guests IS 'Total number of people attending (including the guest)';
COMMENT ON COLUMN event_guests.arrival_location IS 'Where the guest is arriving (e.g., IGI Airport Delhi, New Delhi Railway Station)';
COMMENT ON COLUMN event_guests.needs_accommodation IS 'Whether the guest needs accommodation arranged by the organizer';
COMMENT ON TABLE guest_invitations IS 'Tracking table for sent invitations with delivery status';
