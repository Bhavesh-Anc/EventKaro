-- ============================================================================
-- HEADING 5: VENDOR AVAILABILITY CALENDAR
-- ============================================================================

-- Add availability tracking to vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS availability_calendar JSONB DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS blocked_dates JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS advance_booking_days INTEGER DEFAULT 30;

-- Create vendor availability table for detailed tracking
CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked', 'tentative')),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, date)
);

CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor ON vendor_availability(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date ON vendor_availability(date);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_status ON vendor_availability(status);

-- ============================================================================
-- HEADING 6: TRANSPORTATION COORDINATOR
-- ============================================================================

-- Create transportation management tables
CREATE TABLE IF NOT EXISTS transportation_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'suv', 'van', 'bus', 'tempo', 'auto', 'other')),
  vehicle_name TEXT, -- e.g., "Innova 1", "Wedding Bus"
  capacity INTEGER NOT NULL DEFAULT 4,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transportation_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  wedding_event_id UUID REFERENCES wedding_events(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES transportation_vehicles(id) ON DELETE SET NULL,

  -- Trip details
  trip_name TEXT, -- e.g., "Airport Pickup - Morning"
  trip_type TEXT CHECK (trip_type IN ('pickup', 'drop', 'transfer', 'venue_shuttle')),
  pickup_location TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  drop_location TEXT NOT NULL,
  estimated_arrival TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transportation_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES transportation_trips(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  family_group_id UUID REFERENCES wedding_family_groups(id) ON DELETE SET NULL,
  passenger_name TEXT,
  passenger_count INTEGER DEFAULT 1,
  pickup_confirmed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  CONSTRAINT passenger_reference CHECK (guest_id IS NOT NULL OR family_group_id IS NOT NULL OR passenger_name IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transport_vehicles_event ON transportation_vehicles(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_trips_event ON transportation_trips(event_id);
CREATE INDEX IF NOT EXISTS idx_transport_trips_date ON transportation_trips(pickup_time);
CREATE INDEX IF NOT EXISTS idx_transport_passengers_trip ON transportation_passengers(trip_id);

-- ============================================================================
-- HEADING 7: SEATING CHART ENHANCEMENTS
-- ============================================================================

-- Add more fields to seating_tables if exists, otherwise create
CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  wedding_event_id UUID REFERENCES wedding_events(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  table_number INTEGER,
  capacity INTEGER NOT NULL DEFAULT 8,
  shape TEXT DEFAULT 'round' CHECK (shape IN ('round', 'rectangular', 'oval', 'square')),
  category TEXT DEFAULT 'general' CHECK (category IN ('vip', 'family_bride', 'family_groom', 'friends', 'colleagues', 'general')),

  -- Position for visual chart
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,

  -- Additional details
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest seating assignments
CREATE TABLE IF NOT EXISTS guest_seating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  family_group_id UUID REFERENCES wedding_family_groups(id) ON DELETE CASCADE,
  seat_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seating_reference CHECK (guest_id IS NOT NULL OR family_group_id IS NOT NULL)
);

-- Seating conflicts (don't seat together)
CREATE TABLE IF NOT EXISTS seating_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_a_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  guest_b_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  family_a_id UUID REFERENCES wedding_family_groups(id) ON DELETE CASCADE,
  family_b_id UUID REFERENCES wedding_family_groups(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seating_tables_event ON seating_tables(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_seating_table ON guest_seating(table_id);
CREATE INDEX IF NOT EXISTS idx_seating_conflicts_event ON seating_conflicts(event_id);

-- ============================================================================
-- HEADING 8: WHATSAPP INTEGRATION
-- ============================================================================

-- WhatsApp message tracking
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  family_group_id UUID REFERENCES wedding_family_groups(id) ON DELETE SET NULL,

  -- Message details
  message_type TEXT CHECK (message_type IN ('invitation', 'rsvp_reminder', 'event_update', 'logistics', 'custom')),
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- WhatsApp API response
  whatsapp_message_id TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp broadcast groups
CREATE TABLE IF NOT EXISTS whatsapp_broadcast_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_broadcast_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_group_id UUID NOT NULL REFERENCES whatsapp_broadcast_groups(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  family_group_id UUID REFERENCES wedding_family_groups(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_event ON whatsapp_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_broadcast_event ON whatsapp_broadcast_groups(event_id);

-- ============================================================================
-- HEADING 9: TASK MANAGEMENT FIX
-- ============================================================================

-- Ensure tasks table has all needed columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS wedding_event_id UUID REFERENCES wedding_events(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT; -- daily, weekly, monthly

-- Task templates for wedding planning
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  days_before_wedding INTEGER NOT NULL, -- Negative = after wedding
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default wedding task templates
INSERT INTO task_templates (template_name, category, title, description, days_before_wedding, priority) VALUES
('indian_wedding', 'venue', 'Book wedding venue', 'Research and finalize the main wedding venue', 180, 'high'),
('indian_wedding', 'venue', 'Book venues for other events', 'Finalize venues for mehendi, sangeet, reception', 150, 'high'),
('indian_wedding', 'catering', 'Finalize caterer', 'Select and book catering for all events', 120, 'high'),
('indian_wedding', 'photography', 'Book photographer & videographer', 'Finalize photography and videography team', 120, 'high'),
('indian_wedding', 'decoration', 'Book decorator', 'Select and finalize wedding decorator', 90, 'high'),
('indian_wedding', 'invitations', 'Design wedding card', 'Finalize wedding invitation design', 90, 'medium'),
('indian_wedding', 'invitations', 'Print and distribute cards', 'Get cards printed and start distribution', 60, 'high'),
('indian_wedding', 'attire', 'Shop for wedding outfit', 'Purchase bride/groom wedding attire', 60, 'high'),
('indian_wedding', 'beauty', 'Book makeup artist', 'Finalize bridal makeup artist', 60, 'high'),
('indian_wedding', 'music', 'Book DJ/Band', 'Finalize entertainment for sangeet/reception', 60, 'medium'),
('indian_wedding', 'guests', 'Collect guest RSVPs', 'Follow up on pending RSVPs', 30, 'high'),
('indian_wedding', 'accommodation', 'Block hotel rooms', 'Reserve rooms for outstation guests', 45, 'high'),
('indian_wedding', 'transportation', 'Arrange guest transportation', 'Plan pickups and drops for guests', 30, 'medium'),
('indian_wedding', 'catering', 'Finalize menu', 'Confirm final menu with caterer', 14, 'high'),
('indian_wedding', 'decoration', 'Confirm decoration details', 'Final walkthrough with decorator', 7, 'high'),
('indian_wedding', 'general', 'Create day-of timeline', 'Prepare minute-by-minute schedule', 7, 'high'),
('indian_wedding', 'beauty', 'Bridal trial makeup', 'Schedule and complete makeup trial', 14, 'medium'),
('indian_wedding', 'payments', 'Complete vendor payments', 'Clear all pending vendor payments', 3, 'high'),
('indian_wedding', 'general', 'Emergency kit preparation', 'Prepare wedding day emergency kit', 3, 'low')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);

-- Enable RLS on new tables
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_seating ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcast_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcast_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified - allow authenticated users to access their event data)
CREATE POLICY "event_based_access" ON vendor_availability FOR ALL TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "event_based_access" ON transportation_vehicles FOR ALL TO authenticated
  USING (event_id IN (SELECT e.id FROM events e JOIN organization_members om ON e.organization_id = om.organization_id WHERE om.user_id = auth.uid()));

CREATE POLICY "event_based_access" ON transportation_trips FOR ALL TO authenticated
  USING (event_id IN (SELECT e.id FROM events e JOIN organization_members om ON e.organization_id = om.organization_id WHERE om.user_id = auth.uid()));

CREATE POLICY "event_based_access" ON seating_tables FOR ALL TO authenticated
  USING (event_id IN (SELECT e.id FROM events e JOIN organization_members om ON e.organization_id = om.organization_id WHERE om.user_id = auth.uid()));

CREATE POLICY "event_based_access" ON whatsapp_messages FOR ALL TO authenticated
  USING (event_id IN (SELECT e.id FROM events e JOIN organization_members om ON e.organization_id = om.organization_id WHERE om.user_id = auth.uid()));

CREATE POLICY "public_templates" ON task_templates FOR SELECT TO authenticated USING (true);
