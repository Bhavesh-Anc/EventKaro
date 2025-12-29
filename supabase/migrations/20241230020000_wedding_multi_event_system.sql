-- Wedding Multi-Event System
-- Enables one wedding → multiple sub-events (Engagement, Mehendi, Haldi, Sangeet, Wedding, Reception)
-- Each sub-event has its own venue, guests, vendors, budget, timeline

-- ============================================
-- WEDDING SUB-EVENTS TABLE
-- ============================================

CREATE TABLE wedding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Sub-event details
  event_name TEXT NOT NULL CHECK (event_name IN (
    'engagement',
    'mehendi',
    'haldi',
    'sangeet',
    'wedding',
    'reception',
    'custom'
  )),
  custom_event_name TEXT, -- if event_name = 'custom'
  description TEXT,

  -- Timing
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 60
  ) STORED,

  -- Venue (can be different for each sub-event)
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_latitude DECIMAL(10,8),
  venue_longitude DECIMAL(11,8),
  venue_contact_person TEXT,
  venue_contact_phone TEXT,

  -- Logistics
  dress_code TEXT,
  theme_colors TEXT[], -- Array of color codes
  transportation_provided BOOLEAN DEFAULT FALSE,
  transportation_notes TEXT,

  -- Guest management
  expected_guest_count INTEGER,
  actual_guest_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),

  -- Order/sequence
  sequence_order INTEGER NOT NULL,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (end_datetime > start_datetime),
  UNIQUE(parent_event_id, event_name, start_datetime)
);

CREATE INDEX idx_wedding_events_parent ON wedding_events(parent_event_id);
CREATE INDEX idx_wedding_events_datetime ON wedding_events(start_datetime);
CREATE INDEX idx_wedding_events_sequence ON wedding_events(parent_event_id, sequence_order);

-- ============================================
-- WEDDING EVENT GUESTS (Guest assignment to sub-events)
-- ============================================

CREATE TABLE wedding_event_guest_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

  -- RSVP for THIS specific sub-event
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'maybe')),
  rsvp_responded_at TIMESTAMPTZ,

  -- Plus ones specific to this event
  plus_ones_allowed INTEGER DEFAULT 0,
  plus_ones_confirmed INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(wedding_event_id, guest_id)
);

CREATE INDEX idx_wedding_event_guests_event ON wedding_event_guest_assignments(wedding_event_id);
CREATE INDEX idx_wedding_event_guests_guest ON wedding_event_guest_assignments(guest_id);

-- ============================================
-- WEDDING EVENT VENDORS (Vendor assignment to sub-events)
-- ============================================

CREATE TABLE wedding_event_vendor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,

  -- Scope of work for THIS event
  scope_of_work TEXT,
  deliverables JSONB DEFAULT '[]', -- Array of deliverable items

  -- Timing
  arrival_time TIME,
  setup_time TIME,
  start_time TIME,
  end_time TIME,
  teardown_time TIME,

  -- Status tracking
  confirmed BOOLEAN DEFAULT FALSE,
  arrived BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,

  -- Payment for this specific event
  quoted_amount_inr INTEGER,
  final_amount_inr INTEGER,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(wedding_event_id, vendor_id)
);

CREATE INDEX idx_wedding_event_vendors_event ON wedding_event_vendor_assignments(wedding_event_id);
CREATE INDEX idx_wedding_event_vendors_vendor ON wedding_event_vendor_assignments(vendor_id);

-- ============================================
-- WEDDING EVENT BUDGET (Budget per sub-event)
-- ============================================

CREATE TABLE wedding_event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,

  -- Budget category
  category TEXT NOT NULL CHECK (category IN (
    'venue',
    'catering',
    'decoration',
    'photography',
    'videography',
    'music_dj',
    'entertainment',
    'transportation',
    'gifts_favors',
    'makeup_styling',
    'outfits_jewelry',
    'invitations',
    'lighting',
    'flowers',
    'miscellaneous',
    'other'
  )),
  subcategory TEXT,

  -- Amounts (in paise/smallest currency unit)
  planned_amount_inr INTEGER NOT NULL DEFAULT 0,
  committed_amount_inr INTEGER DEFAULT 0,
  paid_amount_inr INTEGER DEFAULT 0,
  pending_amount_inr INTEGER GENERATED ALWAYS AS (committed_amount_inr - paid_amount_inr) STORED,

  -- Variance tracking
  over_budget BOOLEAN GENERATED ALWAYS AS (committed_amount_inr > planned_amount_inr) STORED,
  variance_inr INTEGER GENERATED ALWAYS AS (committed_amount_inr - planned_amount_inr) STORED,

  notes TEXT,
  vendor_id UUID REFERENCES vendor_profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wedding_budgets_event ON wedding_event_budgets(wedding_event_id);
CREATE INDEX idx_wedding_budgets_category ON wedding_event_budgets(wedding_event_id, category);

-- ============================================
-- WEDDING EVENT TIMELINE CONFLICTS
-- ============================================

-- View to detect timeline conflicts
CREATE OR REPLACE VIEW wedding_event_conflicts AS
SELECT
  e1.id as event1_id,
  e1.event_name as event1_name,
  e1.start_datetime as event1_start,
  e2.id as event2_id,
  e2.event_name as event2_name,
  e2.start_datetime as event2_start,
  'overlapping_times' as conflict_type
FROM wedding_events e1
JOIN wedding_events e2 ON e1.parent_event_id = e2.parent_event_id
  AND e1.id < e2.id
WHERE (e1.start_datetime, e1.end_datetime) OVERLAPS (e2.start_datetime, e2.end_datetime);

-- View to detect vendor conflicts (same vendor at overlapping events)
CREATE OR REPLACE VIEW wedding_vendor_conflicts AS
SELECT
  v1.wedding_event_id as event1_id,
  v2.wedding_event_id as event2_id,
  v1.vendor_id,
  e1.event_name as event1_name,
  e2.event_name as event2_name,
  e1.start_datetime as event1_start,
  e2.start_datetime as event2_start
FROM wedding_event_vendor_assignments v1
JOIN wedding_event_vendor_assignments v2 ON v1.vendor_id = v2.vendor_id
  AND v1.wedding_event_id < v2.wedding_event_id
JOIN wedding_events e1 ON v1.wedding_event_id = e1.id
JOIN wedding_events e2 ON v2.wedding_event_id = e2.id
WHERE e1.parent_event_id = e2.parent_event_id
  AND (e1.start_datetime, e1.end_datetime) OVERLAPS (e2.start_datetime, e2.end_datetime);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_event_guest_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_event_vendor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_event_budgets ENABLE ROW LEVEL SECURITY;

-- Wedding events policies
CREATE POLICY "Org members can manage wedding events"
  ON wedding_events FOR ALL
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Guest assignments policies
CREATE POLICY "Org members can manage guest assignments"
  ON wedding_event_guest_assignments FOR ALL
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Vendor assignments policies
CREATE POLICY "Org members can manage vendor assignments"
  ON wedding_event_vendor_assignments FOR ALL
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Vendors can view their assignments
CREATE POLICY "Vendors can view their assignments"
  ON wedding_event_vendor_assignments FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

-- Budget policies
CREATE POLICY "Org members can manage budgets"
  ON wedding_event_budgets FOR ALL
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER wedding_events_updated_at BEFORE UPDATE ON wedding_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER wedding_event_vendors_updated_at BEFORE UPDATE ON wedding_event_vendor_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER wedding_event_budgets_updated_at BEFORE UPDATE ON wedding_event_budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create default wedding sub-events
CREATE OR REPLACE FUNCTION create_default_wedding_events(parent_id UUID, wedding_date DATE)
RETURNS VOID AS $$
DECLARE
  base_sequence INTEGER := 1;
BEGIN
  -- Engagement (typically 2-3 months before)
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_id,
    'engagement',
    (wedding_date - INTERVAL '90 days')::DATE + TIME '18:00',
    (wedding_date - INTERVAL '90 days')::DATE + TIME '21:00',
    base_sequence
  );

  -- Mehendi (1 day before wedding)
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_id,
    'mehendi',
    (wedding_date - INTERVAL '1 day')::DATE + TIME '15:00',
    (wedding_date - INTERVAL '1 day')::DATE + TIME '20:00',
    base_sequence + 1
  );

  -- Haldi (morning of day before wedding)
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_id,
    'haldi',
    (wedding_date - INTERVAL '1 day')::DATE + TIME '10:00',
    (wedding_date - INTERVAL '1 day')::DATE + TIME '13:00',
    base_sequence + 2
  );

  -- Sangeet (evening before wedding)
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_id,
    'sangeet',
    (wedding_date - INTERVAL '1 day')::DATE + TIME '19:00',
    (wedding_date - INTERVAL '1 day')::DATE + TIME '23:00',
    base_sequence + 3
  );

  -- Wedding (main event)
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_id,
    'wedding',
    wedding_date::DATE + TIME '19:00',
    wedding_date::DATE + TIME '23:00',
    base_sequence + 4
  );

  -- Reception (day after or same evening)
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_event_id,
    'reception',
    (wedding_date + INTERVAL '1 day')::DATE + TIME '19:00',
    (wedding_date + INTERVAL '1 day')::DATE + TIME '23:00',
    base_sequence + 5
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE wedding_events IS 'Sub-events within a wedding (Engagement, Mehendi, Haldi, Sangeet, Wedding, Reception)';
COMMENT ON TABLE wedding_event_guest_assignments IS 'Guest assignments to specific wedding sub-events';
COMMENT ON TABLE wedding_event_vendor_assignments IS 'Vendor assignments with deliverables and timeline for each sub-event';
COMMENT ON TABLE wedding_event_budgets IS 'Budget tracking per sub-event with variance analysis';
COMMENT ON VIEW wedding_event_conflicts IS 'Automatically detect overlapping sub-events';
COMMENT ON VIEW wedding_vendor_conflicts IS 'Detect vendor scheduling conflicts across sub-events';
