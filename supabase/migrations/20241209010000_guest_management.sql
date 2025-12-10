-- Guest Groups (for organizing guests into families, companies, etc.)
CREATE TABLE guest_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT CHECK (group_type IN ('family', 'friends', 'colleagues', 'vendors', 'vip', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_groups_event ON guest_groups(event_id);

-- Guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_group_id UUID REFERENCES guest_groups(id) ON DELETE SET NULL,

  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,

  -- RSVP Status
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'not_attending', 'maybe', 'no_response')),
  rsvp_date TIMESTAMPTZ,
  plus_one_allowed BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  plus_one_rsvp TEXT CHECK (plus_one_rsvp IN ('attending', 'not_attending', 'pending')),

  -- Additional Info
  notes TEXT,
  invitation_sent BOOLEAN DEFAULT FALSE,
  invitation_sent_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,

  -- Metadata
  source TEXT, -- 'manual', 'imported', 'self_registered'
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_guests_group ON guests(guest_group_id);
CREATE INDEX idx_guests_rsvp ON guests(rsvp_status);
CREATE INDEX idx_guests_email ON guests(email);

-- Dietary Preferences
CREATE TABLE guest_dietary_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  preference TEXT NOT NULL CHECK (preference IN (
    'vegetarian',
    'non_vegetarian',
    'vegan',
    'jain',
    'eggetarian',
    'gluten_free',
    'halal',
    'kosher',
    'lactose_free',
    'nut_allergy',
    'other'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id, preference)
);

CREATE INDEX idx_dietary_guest ON guest_dietary_preferences(guest_id);

-- Accommodation Management
CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  hotel_address TEXT,
  hotel_phone TEXT,
  contact_person TEXT,
  total_rooms_blocked INTEGER,
  rooms_assigned INTEGER DEFAULT 0,
  check_in_date DATE,
  check_out_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accommodations_event ON accommodations(event_id);

-- Guest Accommodation Assignments
CREATE TABLE guest_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  room_number TEXT,
  room_type TEXT,
  sharing_with UUID REFERENCES guests(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id, accommodation_id)
);

CREATE INDEX idx_guest_accommodations_guest ON guest_accommodations(guest_id);
CREATE INDEX idx_guest_accommodations_accommodation ON guest_accommodations(accommodation_id);

-- Transportation (optional for future)
CREATE TABLE guest_transportation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  transportation_type TEXT CHECK (transportation_type IN ('flight', 'train', 'bus', 'car', 'other')),
  arrival_date TIMESTAMPTZ,
  arrival_details TEXT, -- flight number, train number, etc.
  departure_date TIMESTAMPTZ,
  departure_details TEXT,
  pickup_required BOOLEAN DEFAULT FALSE,
  pickup_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_transportation_guest ON guest_transportation(guest_id);

-- Enable RLS
ALTER TABLE guest_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_transportation ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Org members can manage guests for their events
CREATE POLICY "Org members can manage guest groups"
  ON guest_groups FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      INNER JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Org members can manage guests"
  ON guests FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      INNER JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Org members can manage dietary preferences"
  ON guest_dietary_preferences FOR ALL
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      INNER JOIN events e ON e.id = g.event_id
      INNER JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Org members can manage accommodations"
  ON accommodations FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      INNER JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Org members can manage guest accommodations"
  ON guest_accommodations FOR ALL
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      INNER JOIN events e ON e.id = g.event_id
      INNER JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Org members can manage guest transportation"
  ON guest_transportation FOR ALL
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      INNER JOIN events e ON e.id = g.event_id
      INNER JOIN organization_members om ON om.organization_id = e.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

-- Triggers for updated_at
CREATE TRIGGER guest_groups_updated_at BEFORE UPDATE ON guest_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER accommodations_updated_at BEFORE UPDATE ON accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER guest_accommodations_updated_at BEFORE UPDATE ON guest_accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER guest_transportation_updated_at BEFORE UPDATE ON guest_transportation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
