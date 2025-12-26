-- Event Planning Tools Migration
-- Guest List, RSVP, Seating Charts, Timeline, Checklists, Vendor Coordination

-- ============================================
-- GUEST LIST & RSVP MANAGEMENT
-- ============================================

CREATE TABLE event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Guest Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  designation TEXT,

  -- Categorization
  guest_type TEXT CHECK (guest_type IN ('vip', 'speaker', 'sponsor', 'attendee', 'staff', 'media', 'other')) DEFAULT 'attendee',
  category TEXT, -- 'family', 'friends', 'business', etc.
  table_number TEXT,
  seat_number TEXT,

  -- RSVP
  invitation_sent BOOLEAN DEFAULT FALSE,
  invitation_sent_at TIMESTAMPTZ,
  rsvp_status TEXT CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'maybe', 'no_response')) DEFAULT 'pending',
  rsvp_responded_at TIMESTAMPTZ,
  plus_one_allowed BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  plus_one_rsvp TEXT CHECK (plus_one_rsvp IN ('accepted', 'declined', 'pending')),

  -- Special Requirements
  dietary_requirements TEXT,
  accessibility_needs TEXT,
  special_requests TEXT,

  -- Notes
  notes TEXT,
  tags TEXT[],

  -- Check-in
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEATING ARRANGEMENTS
-- ============================================

CREATE TABLE seating_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  chart_name TEXT NOT NULL,
  venue_layout JSONB NOT NULL, -- Canvas data for tables/seats: {tables: [{id, x, y, shape, capacity, guests: []}]}
  total_tables INTEGER,
  total_capacity INTEGER,

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_finalized BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENT TIMELINE/SCHEDULE
-- ============================================

CREATE TABLE event_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Timeline Item
  item_title TEXT NOT NULL,
  item_description TEXT,
  item_type TEXT CHECK (item_type IN ('ceremony', 'reception', 'speech', 'performance', 'break', 'activity', 'vendor_arrival', 'setup', 'other')) DEFAULT 'other',

  -- Timing
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  end_time TIMESTAMPTZ,

  -- Assignment
  responsible_person TEXT,
  responsible_vendor_id UUID REFERENCES vendors(id),

  -- Status
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENT CHECKLISTS
-- ============================================

CREATE TABLE event_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  checklist_name TEXT NOT NULL,
  checklist_category TEXT, -- 'venue', 'catering', 'decorations', etc.
  is_template BOOLEAN DEFAULT FALSE,
  event_type TEXT, -- For templates: 'wedding', 'corporate', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES event_checklists(id) ON DELETE CASCADE,

  item_text TEXT NOT NULL,
  item_description TEXT,

  -- Assignment
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_to_vendor_id UUID REFERENCES vendors(id),

  -- Deadline
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHECKLIST TEMPLATES
-- ============================================

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  template_items JSONB NOT NULL, -- Array of {text, category, due_days_before_event, priority}
  is_system_template BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default checklist templates
INSERT INTO checklist_templates (template_name, event_type, template_items, is_system_template) VALUES
('Wedding Planning Checklist', 'wedding', '[
  {"text": "Book wedding venue", "category": "venue", "due_days_before": 365, "priority": "high"},
  {"text": "Hire wedding photographer", "category": "photography", "due_days_before": 270, "priority": "high"},
  {"text": "Book caterer", "category": "catering", "due_days_before": 180, "priority": "high"},
  {"text": "Order wedding invitations", "category": "stationery", "due_days_before": 120, "priority": "medium"},
  {"text": "Book wedding decorator", "category": "decorations", "due_days_before": 90, "priority": "high"},
  {"text": "Finalize menu with caterer", "category": "catering", "due_days_before": 60, "priority": "medium"},
  {"text": "Send wedding invitations", "category": "stationery", "due_days_before": 45, "priority": "high"},
  {"text": "Book makeup artist", "category": "beauty", "due_days_before": 30, "priority": "medium"},
  {"text": "Book mehendi artist", "category": "beauty", "due_days_before": 30, "priority": "medium"},
  {"text": "Book DJ/music band", "category": "entertainment", "due_days_before": 60, "priority": "medium"},
  {"text": "Order wedding cake", "category": "catering", "due_days_before": 30, "priority": "medium"},
  {"text": "Finalize seating chart", "category": "planning", "due_days_before": 14, "priority": "high"},
  {"text": "Confirm with all vendors", "category": "coordination", "due_days_before": 7, "priority": "urgent"},
  {"text": "Prepare vendor payment schedule", "category": "budget", "due_days_before": 7, "priority": "high"}
]', TRUE),

('Corporate Event Checklist', 'corporate', '[
  {"text": "Define event objectives", "category": "planning", "due_days_before": 90, "priority": "high"},
  {"text": "Set event budget", "category": "budget", "due_days_before": 90, "priority": "high"},
  {"text": "Book conference venue", "category": "venue", "due_days_before": 60, "priority": "high"},
  {"text": "Arrange AV equipment", "category": "technology", "due_days_before": 45, "priority": "medium"},
  {"text": "Book speakers", "category": "content", "due_days_before": 60, "priority": "high"},
  {"text": "Design event branding", "category": "marketing", "due_days_before": 45, "priority": "medium"},
  {"text": "Set up event registration", "category": "registration", "due_days_before": 45, "priority": "high"},
  {"text": "Book catering", "category": "catering", "due_days_before": 30, "priority": "medium"},
  {"text": "Arrange accommodation for speakers", "category": "logistics", "due_days_before": 30, "priority": "medium"},
  {"text": "Create event agenda", "category": "content", "due_days_before": 21, "priority": "high"},
  {"text": "Send invitations", "category": "marketing", "due_days_before": 30, "priority": "high"},
  {"text": "Order name badges", "category": "materials", "due_days_before": 14, "priority": "medium"},
  {"text": "Brief event staff", "category": "coordination", "due_days_before": 7, "priority": "high"}
]', TRUE),

('Birthday Party Checklist', 'birthday', '[
  {"text": "Book party venue", "category": "venue", "due_days_before": 60, "priority": "high"},
  {"text": "Send invitations", "category": "invitations", "due_days_before": 21, "priority": "high"},
  {"text": "Book entertainment (DJ/magician)", "category": "entertainment", "due_days_before": 30, "priority": "medium"},
  {"text": "Order birthday cake", "category": "catering", "due_days_before": 7, "priority": "high"},
  {"text": "Book photographer", "category": "photography", "due_days_before": 30, "priority": "medium"},
  {"text": "Book decorator", "category": "decorations", "due_days_before": 21, "priority": "medium"},
  {"text": "Finalize menu with caterer", "category": "catering", "due_days_before": 14, "priority": "medium"},
  {"text": "Buy party supplies", "category": "materials", "due_days_before": 7, "priority": "low"},
  {"text": "Confirm RSVP count", "category": "planning", "due_days_before": 7, "priority": "high"}
]', TRUE);

-- ============================================
-- VENDOR COORDINATION
-- ============================================

CREATE TABLE vendor_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES vendor_bookings(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  -- Contact Status
  last_contacted_at TIMESTAMPTZ,
  next_followup_date DATE,
  contact_notes TEXT,

  -- Documentation Status
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMPTZ,
  payment_schedule_agreed BOOLEAN DEFAULT FALSE,
  requirements_shared BOOLEAN DEFAULT FALSE,

  -- Preparation Status
  vendor_confirmed BOOLEAN DEFAULT FALSE,
  vendor_confirmed_at TIMESTAMPTZ,
  setup_time_confirmed BOOLEAN DEFAULT FALSE,
  special_requirements_met BOOLEAN DEFAULT FALSE,

  -- Overall Status
  coordination_status TEXT CHECK (coordination_status IN ('pending', 'in_progress', 'confirmed', 'issue', 'complete')) DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_guests_event ON event_guests(event_id);
CREATE INDEX idx_guests_rsvp ON event_guests(rsvp_status);
CREATE INDEX idx_guests_checked_in ON event_guests(checked_in);
CREATE INDEX idx_seating_charts_event ON seating_charts(event_id);
CREATE INDEX idx_timeline_event ON event_timeline(event_id);
CREATE INDEX idx_timeline_time ON event_timeline(scheduled_time);
CREATE INDEX idx_checklists_event ON event_checklists(event_id);
CREATE INDEX idx_checklist_items_checklist ON checklist_items(checklist_id);
CREATE INDEX idx_checklist_items_due ON checklist_items(due_date);
CREATE INDEX idx_checklist_items_completed ON checklist_items(is_completed);
CREATE INDEX idx_vendor_coordination_event ON vendor_coordination(event_id);
CREATE INDEX idx_vendor_coordination_vendor ON vendor_coordination(vendor_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_coordination ENABLE ROW LEVEL SECURITY;

-- Policies: Event organizers can manage their event data
CREATE POLICY "Event organizers can manage guests"
  ON event_guests FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage seating charts"
  ON seating_charts FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage timeline"
  ON event_timeline FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage checklists"
  ON event_checklists FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage checklist items"
  ON checklist_items FOR ALL
  TO authenticated
  USING (
    checklist_id IN (
      SELECT c.id FROM event_checklists c
      JOIN events e ON c.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage vendor coordination"
  ON vendor_coordination FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to auto-update checklist progress
CREATE OR REPLACE FUNCTION update_checklist_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- This can be used to track overall checklist completion percentage
  -- For now, it's a placeholder for future enhancements
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_checklist_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_progress();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE event_guests IS 'Guest list management with RSVP tracking and check-in';
COMMENT ON TABLE seating_charts IS 'Visual seating arrangements with drag-drop layout';
COMMENT ON TABLE event_timeline IS 'Detailed event schedule and timeline';
COMMENT ON TABLE event_checklists IS 'Planning checklists organized by category';
COMMENT ON TABLE checklist_items IS 'Individual checklist tasks with assignments and deadlines';
COMMENT ON TABLE checklist_templates IS 'Pre-built checklist templates by event type';
COMMENT ON TABLE vendor_coordination IS 'Vendor coordination and status tracking dashboard';
