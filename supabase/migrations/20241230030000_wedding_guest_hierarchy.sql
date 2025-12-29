-- Wedding Guest Hierarchy & Family Management
-- Indian weddings have relationships, not just guests
-- Track family side, priority, elderly/kids, outstation, hotel needs, pickup requirements

-- ============================================
-- EXTEND GUESTS TABLE FOR WEDDING-SPECIFIC FIELDS
-- ============================================

ALTER TABLE guests
-- Family & Relationship
ADD COLUMN IF NOT EXISTS family_side TEXT CHECK (family_side IN ('bride', 'groom', 'common')) DEFAULT 'common',
ADD COLUMN IF NOT EXISTS relationship TEXT, -- 'uncle', 'cousin', 'friend', 'colleague', etc.
ADD COLUMN IF NOT EXISTS family_group_name TEXT, -- 'Sharma Family', 'Mehta Family'
ADD COLUMN IF NOT EXISTS head_of_family BOOLEAN DEFAULT FALSE,

-- Priority & Category
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'general' CHECK (priority IN ('vip', 'close_family', 'extended_family', 'friends', 'general')),
ADD COLUMN IF NOT EXISTS guest_category TEXT CHECK (guest_category IN ('family', 'friends', 'colleagues', 'neighbors', 'relatives', 'other')),

-- Demographics
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('infant', 'child', 'teenager', 'adult', 'elderly')),
ADD COLUMN IF NOT EXISTS is_elderly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_child BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS special_care_notes TEXT, -- for elderly/differently-abled

-- Location & Travel
ADD COLUMN IF NOT EXISTS is_outstation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_local BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS home_city TEXT,
ADD COLUMN IF NOT EXISTS home_state TEXT,
ADD COLUMN IF NOT EXISTS distance_km INTEGER,

-- Accommodation
ADD COLUMN IF NOT EXISTS hotel_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS room_sharing_preference TEXT CHECK (room_sharing_preference IN ('single', 'couple', 'family', 'shared', 'any')),
ADD COLUMN IF NOT EXISTS hotel_check_in_date DATE,
ADD COLUMN IF NOT EXISTS hotel_check_out_date DATE,
ADD COLUMN IF NOT EXISTS hotel_nights INTEGER,

-- Transportation
ADD COLUMN IF NOT EXISTS pickup_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS pickup_datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dropoff_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dropoff_location TEXT,
ADD COLUMN IF NOT EXISTS dropoff_datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS transport_type TEXT CHECK (transport_type IN ('bus', 'car', 'self', 'arranged')),

-- Food Preferences (Indian context)
ADD COLUMN IF NOT EXISTS food_preference TEXT CHECK (food_preference IN ('vegetarian', 'non_vegetarian', 'jain', 'vegan', 'eggetarian')),
ADD COLUMN IF NOT EXISTS food_allergies TEXT[],
ADD COLUMN IF NOT EXISTS alcohol_preference BOOLEAN DEFAULT TRUE,

-- Gift Registry
ADD COLUMN IF NOT EXISTS gift_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gift_amount_inr INTEGER,
ADD COLUMN IF NOT EXISTS gift_notes TEXT,

-- Communication
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'hindi',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS alternate_contact TEXT,

-- Seating (will be used for seating arrangement)
ADD COLUMN IF NOT EXISTS table_number TEXT,
ADD COLUMN IF NOT EXISTS seat_number TEXT,
ADD COLUMN IF NOT EXISTS seating_preferences TEXT;

-- ============================================
-- FAMILY GROUPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS wedding_family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Family details
  family_name TEXT NOT NULL, -- 'Sharma Family', 'Gupta Parivaar'
  family_side TEXT NOT NULL CHECK (family_side IN ('bride', 'groom')),
  head_of_family_guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,

  -- Contact
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  whatsapp_group_link TEXT,

  -- Logistics summary
  total_members INTEGER DEFAULT 0,
  members_confirmed INTEGER DEFAULT 0,
  members_declined INTEGER DEFAULT 0,
  members_pending INTEGER DEFAULT 0,

  -- Accommodation
  rooms_required INTEGER DEFAULT 0,
  rooms_allocated INTEGER DEFAULT 0,

  -- Transportation
  pickup_required BOOLEAN DEFAULT FALSE,
  bus_allocated BOOLEAN DEFAULT FALSE,

  -- Notes
  special_requirements TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, family_name)
);

CREATE INDEX idx_wedding_family_groups_event ON wedding_family_groups(event_id);
CREATE INDEX idx_wedding_family_groups_side ON wedding_family_groups(family_side);

-- ============================================
-- HOTEL INVENTORY & ROOM ALLOCATION
-- ============================================

CREATE TABLE wedding_hotel_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Hotel details
  hotel_name TEXT NOT NULL,
  hotel_address TEXT,
  hotel_city TEXT,
  hotel_phone TEXT,
  hotel_contact_person TEXT,
  hotel_email TEXT,
  distance_from_venue_km DECIMAL(5,2),

  -- Room blocks
  total_rooms_blocked INTEGER NOT NULL,
  rooms_allocated INTEGER DEFAULT 0,
  rooms_available INTEGER GENERATED ALWAYS AS (total_rooms_blocked - rooms_allocated) STORED,

  -- Dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,

  -- Pricing
  rate_per_room_per_night_inr INTEGER,
  total_cost_inr INTEGER,

  -- Amenities
  amenities TEXT[],
  meal_plan TEXT CHECK (meal_plan IN ('room_only', 'breakfast', 'half_board', 'full_board')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (check_out_date > check_in_date)
);

CREATE INDEX idx_wedding_hotels_event ON wedding_hotel_inventory(event_id);

-- ============================================
-- ROOM ASSIGNMENTS
-- ============================================

CREATE TABLE wedding_room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_inventory_id UUID NOT NULL REFERENCES wedding_hotel_inventory(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

  -- Room details
  room_number TEXT,
  room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'suite', 'family')),
  floor_number INTEGER,

  -- Sharing
  sharing_with_guest_ids UUID[], -- Array of guest IDs sharing this room
  is_primary_occupant BOOLEAN DEFAULT TRUE,

  -- Dates (can be subset of hotel block dates)
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,

  -- Special requests
  floor_preference TEXT CHECK (floor_preference IN ('ground', 'low', 'high', 'any')),
  bed_preference TEXT CHECK (bed_preference IN ('single', 'double', 'twin', 'any')),
  special_requests TEXT,

  -- Status
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_number TEXT,
  checked_in BOOLEAN DEFAULT FALSE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (check_out_date > check_in_date),
  UNIQUE(hotel_inventory_id, room_number, check_in_date)
);

CREATE INDEX idx_wedding_rooms_hotel ON wedding_room_assignments(hotel_inventory_id);
CREATE INDEX idx_wedding_rooms_guest ON wedding_room_assignments(guest_id);

-- ============================================
-- TRANSPORTATION SCHEDULE
-- ============================================

CREATE TABLE wedding_transportation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  wedding_event_id UUID REFERENCES wedding_events(id) ON DELETE CASCADE, -- Link to specific sub-event

  -- Vehicle details
  vehicle_type TEXT CHECK (vehicle_type IN ('bus', 'tempo_traveler', 'car', 'luxury_car', 'sedan')),
  vehicle_number TEXT,
  vehicle_capacity INTEGER NOT NULL,
  seats_allocated INTEGER DEFAULT 0,
  seats_available INTEGER GENERATED ALWAYS AS (vehicle_capacity - seats_allocated) STORED,

  -- Route
  route_name TEXT, -- 'Airport Pickup - Lot 1', 'Hotel to Venue - Morning'
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  estimated_arrival_datetime TIMESTAMPTZ,

  -- Driver
  driver_name TEXT,
  driver_phone TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'completed', 'cancelled')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wedding_transport_event ON wedding_transportation_schedule(event_id);
CREATE INDEX idx_wedding_transport_datetime ON wedding_transportation_schedule(pickup_datetime);

-- ============================================
-- GUEST TRANSPORT ASSIGNMENTS
-- ============================================

CREATE TABLE wedding_guest_transport_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportation_schedule_id UUID NOT NULL REFERENCES wedding_transportation_schedule(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

  -- Seat assignment
  seat_number TEXT,

  -- Confirmation
  confirmed BOOLEAN DEFAULT FALSE,
  checked_in BOOLEAN DEFAULT FALSE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(transportation_schedule_id, guest_id)
);

CREATE INDEX idx_wedding_transport_assign_schedule ON wedding_guest_transport_assignments(transportation_schedule_id);
CREATE INDEX idx_wedding_transport_assign_guest ON wedding_guest_transport_assignments(guest_id);

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- Guest summary by family side
CREATE OR REPLACE VIEW wedding_guest_summary_by_side AS
SELECT
  event_id,
  family_side,
  COUNT(*) as total_guests,
  COUNT(*) FILTER (WHERE rsvp_status = 'accepted') as accepted,
  COUNT(*) FILTER (WHERE rsvp_status = 'declined') as declined,
  COUNT(*) FILTER (WHERE rsvp_status = 'pending') as pending,
  COUNT(*) FILTER (WHERE is_outstation = TRUE) as outstation,
  COUNT(*) FILTER (WHERE hotel_required = TRUE) as needs_hotel,
  COUNT(*) FILTER (WHERE pickup_required = TRUE) as needs_pickup,
  COUNT(*) FILTER (WHERE is_elderly = TRUE) as elderly_count,
  COUNT(*) FILTER (WHERE is_child = TRUE) as child_count
FROM guests
WHERE event_id IN (SELECT id FROM events WHERE event_type = 'wedding')
GROUP BY event_id, family_side;

-- Hotel utilization summary
CREATE OR REPLACE VIEW wedding_hotel_utilization AS
SELECT
  h.id,
  h.hotel_name,
  h.total_rooms_blocked,
  h.rooms_allocated,
  h.rooms_available,
  COUNT(DISTINCT r.guest_id) as total_guests,
  ROUND((h.rooms_allocated::DECIMAL / h.total_rooms_blocked * 100), 2) as utilization_percentage
FROM wedding_hotel_inventory h
LEFT JOIN wedding_room_assignments r ON h.id = r.hotel_inventory_id
GROUP BY h.id;

-- Transportation capacity vs demand
CREATE OR REPLACE VIEW wedding_transport_capacity AS
SELECT
  t.id,
  t.route_name,
  t.pickup_datetime,
  t.vehicle_capacity,
  t.seats_allocated,
  t.seats_available,
  COUNT(ta.guest_id) as guests_assigned,
  CASE
    WHEN COUNT(ta.guest_id) > t.vehicle_capacity THEN 'OVERBOOKED'
    WHEN COUNT(ta.guest_id) = t.vehicle_capacity THEN 'FULL'
    ELSE 'AVAILABLE'
  END as capacity_status
FROM wedding_transportation_schedule t
LEFT JOIN wedding_guest_transport_assignments ta ON t.id = ta.transportation_schedule_id
GROUP BY t.id;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE wedding_family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_hotel_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_transportation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_guest_transport_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for all wedding guest tables
CREATE POLICY "Org members can manage family groups"
  ON wedding_family_groups FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can manage hotel inventory"
  ON wedding_hotel_inventory FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can manage room assignments"
  ON wedding_room_assignments FOR ALL
  TO authenticated
  USING (
    hotel_inventory_id IN (
      SELECT h.id FROM wedding_hotel_inventory h
      JOIN events e ON h.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can manage transportation"
  ON wedding_transportation_schedule FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can manage transport assignments"
  ON wedding_guest_transport_assignments FOR ALL
  TO authenticated
  USING (
    transportation_schedule_id IN (
      SELECT t.id FROM wedding_transportation_schedule t
      JOIN events e ON t.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER wedding_family_groups_updated_at BEFORE UPDATE ON wedding_family_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER wedding_hotel_inventory_updated_at BEFORE UPDATE ON wedding_hotel_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER wedding_room_assignments_updated_at BEFORE UPDATE ON wedding_room_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER wedding_transportation_updated_at BEFORE UPDATE ON wedding_transportation_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to auto-update family group counts
CREATE OR REPLACE FUNCTION update_family_group_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE wedding_family_groups
    SET
      total_members = (SELECT COUNT(*) FROM guests WHERE family_group_name = NEW.family_group_name AND event_id = NEW.event_id),
      members_confirmed = (SELECT COUNT(*) FROM guests WHERE family_group_name = NEW.family_group_name AND event_id = NEW.event_id AND rsvp_status = 'accepted'),
      members_declined = (SELECT COUNT(*) FROM guests WHERE family_group_name = NEW.family_group_name AND event_id = NEW.event_id AND rsvp_status = 'declined'),
      members_pending = (SELECT COUNT(*) FROM guests WHERE family_group_name = NEW.family_group_name AND event_id = NEW.event_id AND rsvp_status = 'pending')
    WHERE family_name = NEW.family_group_name AND event_id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_family_counts_on_guest_change
  AFTER INSERT OR UPDATE OF rsvp_status, family_group_name ON guests
  FOR EACH ROW
  WHEN (NEW.family_group_name IS NOT NULL)
  EXECUTE FUNCTION update_family_group_counts();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN guests.family_side IS 'Bride, Groom, or Common guest';
COMMENT ON COLUMN guests.priority IS 'VIP, Close Family, Extended Family, Friends, General';
COMMENT ON COLUMN guests.is_outstation IS 'Guest coming from out of town/city';
COMMENT ON COLUMN guests.hotel_required IS 'Does guest need hotel accommodation';
COMMENT ON COLUMN guests.pickup_required IS 'Does guest need airport/station pickup';
COMMENT ON TABLE wedding_family_groups IS 'Family-wise grouping of guests for better management';
COMMENT ON TABLE wedding_hotel_inventory IS 'Hotel room inventory and blocking details';
COMMENT ON TABLE wedding_room_assignments IS 'Room assignments for outstation guests';
COMMENT ON TABLE wedding_transportation_schedule IS 'Bus/car schedule for guest transportation';
COMMENT ON VIEW wedding_guest_summary_by_side IS 'Guest statistics by bride/groom side';
