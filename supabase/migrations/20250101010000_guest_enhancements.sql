-- Guest Management Enhancements
-- Add relationship, age group, and per-event RSVP tracking

-- Add new columns to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS relationship TEXT CHECK (relationship IN ('family', 'friend', 'colleague', 'neighbor', 'other'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS relationship_detail TEXT; -- e.g., "Bride's cousin", "College friend"
ALTER TABLE guests ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('child', 'teen', 'adult', 'senior'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'standard' CHECK (priority IN ('vip', 'important', 'standard', 'optional'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS invitation_wave INTEGER DEFAULT 1; -- 1=first wave, 2=second wave, etc.
ALTER TABLE guests ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'whatsapp', 'phone', 'any'));
ALTER TABLE guests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create per-event RSVP tracking table
CREATE TABLE IF NOT EXISTS guest_event_rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  wedding_event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'tentative')),
  rsvp_date TIMESTAMPTZ,
  plus_one_attending BOOLEAN DEFAULT FALSE,
  dietary_preference TEXT,
  arrival_time TEXT,
  transportation_needed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id, wedding_event_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guests_relationship ON guests(relationship);
CREATE INDEX IF NOT EXISTS idx_guests_age_group ON guests(age_group);
CREATE INDEX IF NOT EXISTS idx_guests_priority ON guests(priority);
CREATE INDEX IF NOT EXISTS idx_guest_event_rsvp_guest ON guest_event_rsvp(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_event_rsvp_event ON guest_event_rsvp(wedding_event_id);
CREATE INDEX IF NOT EXISTS idx_guest_event_rsvp_status ON guest_event_rsvp(rsvp_status);

-- Enable RLS
ALTER TABLE guest_event_rsvp ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guest_event_rsvp
CREATE POLICY "Users can view guest event rsvp for their events"
  ON guest_event_rsvp FOR SELECT
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can manage guest event rsvp for their events"
  ON guest_event_rsvp FOR ALL
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

-- Update trigger for guest_event_rsvp
CREATE TRIGGER guest_event_rsvp_updated_at
  BEFORE UPDATE ON guest_event_rsvp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for guest summary with event attendance
CREATE OR REPLACE VIEW guest_event_summary AS
SELECT
  g.id as guest_id,
  g.first_name,
  g.last_name,
  g.email,
  g.phone,
  g.event_id,
  g.relationship,
  g.age_group,
  g.priority,
  COUNT(ger.id) as total_events_invited,
  COUNT(CASE WHEN ger.rsvp_status = 'accepted' THEN 1 END) as events_attending,
  COUNT(CASE WHEN ger.rsvp_status = 'declined' THEN 1 END) as events_declined,
  COUNT(CASE WHEN ger.rsvp_status = 'pending' THEN 1 END) as events_pending
FROM guests g
LEFT JOIN guest_event_rsvp ger ON g.id = ger.guest_id
GROUP BY g.id, g.first_name, g.last_name, g.email, g.phone, g.event_id, g.relationship, g.age_group, g.priority;

-- Comments for documentation
COMMENT ON TABLE guest_event_rsvp IS 'Tracks RSVP status per guest per wedding sub-event (mehendi, sangeet, reception, etc.)';
COMMENT ON COLUMN guests.relationship IS 'Guest relationship to couple: family, friend, colleague, neighbor, other';
COMMENT ON COLUMN guests.age_group IS 'Age category for seating and catering planning: child, teen, adult, senior';
COMMENT ON COLUMN guests.priority IS 'Invitation priority: vip (must attend), important, standard, optional';
COMMENT ON COLUMN guests.invitation_wave IS 'Which round of invitations (1=first/close family, 2=extended, etc.)';
