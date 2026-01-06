-- ============================================================================
-- EventKaro: MASTER SCHEMA - Run this single file to set up everything
-- This file creates all tables in the correct dependency order
-- Safe to run multiple times (idempotent)
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE BASE TABLES (no foreign key dependencies on other new tables)
-- ============================================================================

-- 1.1 Wedding Events Table (depends only on events table)
CREATE TABLE IF NOT EXISTS public.wedding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'engagement', 'mehendi', 'haldi', 'sangeet', 'wedding', 'reception', 'custom'
  )),
  custom_event_name TEXT,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_datetime TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '3 hours'),
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_latitude DECIMAL(10,8),
  venue_longitude DECIMAL(11,8),
  venue_contact_person TEXT,
  venue_contact_phone TEXT,
  dress_code TEXT,
  theme_colors TEXT[],
  transportation_provided BOOLEAN DEFAULT FALSE,
  transportation_notes TEXT,
  expected_guest_count INTEGER,
  actual_guest_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  sequence_order INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_events_parent ON public.wedding_events(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_wedding_events_datetime ON public.wedding_events(start_datetime);

-- 1.2 Tasks Table (depends only on events, organizations, auth.users)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  assigned_to UUID,
  assigned_to_name TEXT,
  wedding_event_id UUID,
  vendor_id UUID,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  dependencies UUID[],
  reminder_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);

-- 1.3 Task Templates Table
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL DEFAULT 'indian_wedding',
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  days_before_wedding INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('medical', 'security', 'family', 'vendor', 'emergency_services', 'transport', 'other')),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  available_24x7 BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_event_id ON public.emergency_contacts(event_id);

-- 1.5 Event Team Members Table
CREATE TABLE IF NOT EXISTS public.event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  invited_email TEXT,
  name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'declined')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_team_members_event_id ON public.event_team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_user_id ON public.event_team_members(user_id);

-- 1.6 Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('rsvp_deadline', 'payment_due', 'task_deadline', 'event_countdown', 'vendor_followup', 'guest_travel', 'custom')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  send_via TEXT[] DEFAULT ARRAY['email'],
  recipients TEXT DEFAULT 'all_guests' CHECK (recipients IN ('all_guests', 'pending_rsvp', 'confirmed_guests', 'team', 'specific')),
  recipient_ids UUID[],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_event_id ON public.reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON public.reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

-- 1.7 Runsheet Items Table
CREATE TABLE IF NOT EXISTS public.runsheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  wedding_event_id UUID,
  time TIME NOT NULL,
  end_time TIME,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  assigned_to TEXT[],
  category TEXT DEFAULT 'other' CHECK (category IN ('ceremony', 'ritual', 'photo', 'food', 'entertainment', 'logistics', 'transition', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'skipped')),
  notes TEXT,
  is_important BOOLEAN DEFAULT false,
  actual_start_time TIME,
  actual_end_time TIME,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runsheet_items_event_id ON public.runsheet_items(event_id);
CREATE INDEX IF NOT EXISTS idx_runsheet_items_time ON public.runsheet_items(time);

-- 1.8 Event Photos Table
CREATE TABLE IF NOT EXISTS public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  category TEXT DEFAULT 'other',
  uploaded_by TEXT DEFAULT 'host',
  uploader_id UUID,
  uploader_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON public.event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_category ON public.event_photos(category);

-- 1.9 Photo Albums Table
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID,
  photo_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID,
  phone_number TEXT NOT NULL,
  message_type TEXT,
  message_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_event ON public.whatsapp_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);

-- 1.11 Transportation Routes Table
CREATE TABLE IF NOT EXISTS public.transportation_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  wedding_event_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  vehicle_type TEXT,
  capacity INTEGER,
  pickup_location TEXT NOT NULL,
  pickup_time TIME,
  dropoff_location TEXT NOT NULL,
  dropoff_time TIME,
  driver_name TEXT,
  driver_phone TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transportation_routes_event ON public.transportation_routes(event_id);

-- 1.12 Seating Arrangements Table
CREATE TABLE IF NOT EXISTS public.seating_arrangements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  wedding_event_id UUID,
  name TEXT NOT NULL,
  table_number INTEGER,
  capacity INTEGER DEFAULT 10,
  category TEXT,
  location_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seating_arrangements_event ON public.seating_arrangements(event_id);

-- ============================================================================
-- STEP 2: CREATE TABLES WITH DEPENDENCIES ON STEP 1 TABLES
-- ============================================================================

-- 2.1 Guest Event RSVP Table (depends on guests and wedding_events)
CREATE TABLE IF NOT EXISTS public.guest_event_rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  wedding_event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_guest_event_rsvp_guest ON public.guest_event_rsvp(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_event_rsvp_event ON public.guest_event_rsvp(wedding_event_id);
CREATE INDEX IF NOT EXISTS idx_guest_event_rsvp_status ON public.guest_event_rsvp(rsvp_status);

-- 2.2 Invitations Table (depends on guests)
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'rsvp_completed')),
  sent_via TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  rsvp_completed_at TIMESTAMPTZ,
  template_id TEXT,
  personalized_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_guest_id ON public.invitations(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- 2.3 Guest Transportation Assignments (depends on transportation_routes and guests)
CREATE TABLE IF NOT EXISTS public.guest_transportation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.transportation_routes(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  pickup_confirmed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_guest_transportation_route ON public.guest_transportation(route_id);
CREATE INDEX IF NOT EXISTS idx_guest_transportation_guest ON public.guest_transportation(guest_id);

-- 2.4 Guest Seating Assignments (depends on seating_arrangements and guests)
CREATE TABLE IF NOT EXISTS public.guest_seating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_id UUID NOT NULL REFERENCES public.seating_arrangements(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  seat_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seating_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_guest_seating_arrangement ON public.guest_seating(seating_id);
CREATE INDEX IF NOT EXISTS idx_guest_seating_guest ON public.guest_seating(guest_id);

-- ============================================================================
-- STEP 3: ADD MISSING COLUMNS TO EXISTING TABLES (BEFORE RLS POLICIES!)
-- ============================================================================

DO $$
BEGIN
  -- Add columns to guests table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guests') THEN
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS relationship TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS relationship_detail TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS age_group TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'standard'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS invitation_wave INTEGER DEFAULT 1; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS whatsapp_number TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'email'; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS notes TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[]; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS accommodation_required BOOLEAN DEFAULT false; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS transportation_required BOOLEAN DEFAULT false; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS arrival_date DATE; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS departure_date DATE; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add columns to vendors table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
    BEGIN ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[]; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add route_id to guest_transportation if missing (critical for RLS policy)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_transportation') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guest_transportation' AND column_name = 'route_id') THEN
      BEGIN ALTER TABLE public.guest_transportation ADD COLUMN route_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;
    BEGIN ALTER TABLE public.guest_transportation ADD COLUMN IF NOT EXISTS guest_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guest_transportation ADD COLUMN IF NOT EXISTS pickup_confirmed BOOLEAN DEFAULT false; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guest_transportation ADD COLUMN IF NOT EXISTS notes TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add seating_id to guest_seating if missing (critical for RLS policy)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_seating') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guest_seating' AND column_name = 'seating_id') THEN
      BEGIN ALTER TABLE public.guest_seating ADD COLUMN seating_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;
    BEGIN ALTER TABLE public.guest_seating ADD COLUMN IF NOT EXISTS guest_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.guest_seating ADD COLUMN IF NOT EXISTS seat_number INTEGER; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add columns to tasks if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    BEGIN ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS wedding_event_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS vendor_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notes TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS dependencies UUID[]; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add columns to runsheet_items if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'runsheet_items') THEN
    BEGIN ALTER TABLE public.runsheet_items ADD COLUMN IF NOT EXISTS wedding_event_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add columns to transportation_routes if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transportation_routes') THEN
    BEGIN ALTER TABLE public.transportation_routes ADD COLUMN IF NOT EXISTS wedding_event_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;

  -- Add columns to seating_arrangements if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seating_arrangements') THEN
    BEGIN ALTER TABLE public.seating_arrangements ADD COLUMN IF NOT EXISTS wedding_event_id UUID; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS (after all tables exist)
-- ============================================================================

-- Add FK from tasks to wedding_events (if not already there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_wedding_event_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_wedding_event_id_fkey
      FOREIGN KEY (wedding_event_id) REFERENCES public.wedding_events(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;

-- Add FK from runsheet_items to wedding_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'runsheet_items_wedding_event_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE public.runsheet_items
      ADD CONSTRAINT runsheet_items_wedding_event_id_fkey
      FOREIGN KEY (wedding_event_id) REFERENCES public.wedding_events(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runsheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_event_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_transportation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_seating ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================

-- Helper function for org member check
CREATE OR REPLACE FUNCTION is_org_member_for_event(p_event_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organization_members om ON e.organization_id = om.organization_id
    WHERE e.id = p_event_id AND om.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wedding Events Policies
DROP POLICY IF EXISTS "wedding_events_org_access" ON public.wedding_events;
CREATE POLICY "wedding_events_org_access" ON public.wedding_events FOR ALL TO authenticated
  USING (is_org_member_for_event(parent_event_id));

-- Tasks Policies
DROP POLICY IF EXISTS "tasks_org_access" ON public.tasks;
CREATE POLICY "tasks_org_access" ON public.tasks FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- Task Templates (public read)
DROP POLICY IF EXISTS "task_templates_public_read" ON public.task_templates;
CREATE POLICY "task_templates_public_read" ON public.task_templates FOR SELECT TO authenticated USING (true);

-- Emergency Contacts
DROP POLICY IF EXISTS "emergency_contacts_event_access" ON public.emergency_contacts;
CREATE POLICY "emergency_contacts_event_access" ON public.emergency_contacts FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

-- Event Team Members
DROP POLICY IF EXISTS "team_members_event_access" ON public.event_team_members;
CREATE POLICY "team_members_event_access" ON public.event_team_members FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id) OR user_id = auth.uid());

-- Reminders
DROP POLICY IF EXISTS "reminders_event_access" ON public.reminders;
CREATE POLICY "reminders_event_access" ON public.reminders FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

-- Runsheet Items
DROP POLICY IF EXISTS "runsheet_event_access" ON public.runsheet_items;
CREATE POLICY "runsheet_event_access" ON public.runsheet_items FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

-- Event Photos
DROP POLICY IF EXISTS "photos_view_approved" ON public.event_photos;
CREATE POLICY "photos_view_approved" ON public.event_photos FOR SELECT TO authenticated
  USING (is_approved = true OR is_org_member_for_event(event_id));

DROP POLICY IF EXISTS "photos_manage" ON public.event_photos;
CREATE POLICY "photos_manage" ON public.event_photos FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

DROP POLICY IF EXISTS "photos_public_insert" ON public.event_photos;
CREATE POLICY "photos_public_insert" ON public.event_photos FOR INSERT WITH CHECK (true);

-- Photo Albums
DROP POLICY IF EXISTS "albums_event_access" ON public.photo_albums;
CREATE POLICY "albums_event_access" ON public.photo_albums FOR ALL TO authenticated
  USING (is_public = true OR is_org_member_for_event(event_id));

-- WhatsApp Messages
DROP POLICY IF EXISTS "whatsapp_event_access" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_event_access" ON public.whatsapp_messages FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

-- Guest Event RSVP
DROP POLICY IF EXISTS "guest_rsvp_access" ON public.guest_event_rsvp;
CREATE POLICY "guest_rsvp_access" ON public.guest_event_rsvp FOR ALL TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM public.wedding_events we
      WHERE is_org_member_for_event(we.parent_event_id)
    )
  );

-- Invitations
DROP POLICY IF EXISTS "invitations_event_access" ON public.invitations;
CREATE POLICY "invitations_event_access" ON public.invitations FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

DROP POLICY IF EXISTS "invitations_public_read" ON public.invitations;
CREATE POLICY "invitations_public_read" ON public.invitations FOR SELECT USING (true);

-- Transportation Routes
DROP POLICY IF EXISTS "transport_routes_access" ON public.transportation_routes;
CREATE POLICY "transport_routes_access" ON public.transportation_routes FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

-- Guest Transportation (route_id column now exists from STEP 3)
DROP POLICY IF EXISTS "guest_transport_access" ON public.guest_transportation;
CREATE POLICY "guest_transport_access" ON public.guest_transportation FOR ALL TO authenticated
  USING (
    route_id IN (
      SELECT id FROM public.transportation_routes tr
      WHERE is_org_member_for_event(tr.event_id)
    )
  );

-- Seating Arrangements
DROP POLICY IF EXISTS "seating_arrangements_access" ON public.seating_arrangements;
CREATE POLICY "seating_arrangements_access" ON public.seating_arrangements FOR ALL TO authenticated
  USING (is_org_member_for_event(event_id));

-- Guest Seating (seating_id column now exists from STEP 3)
DROP POLICY IF EXISTS "guest_seating_access" ON public.guest_seating;
CREATE POLICY "guest_seating_access" ON public.guest_seating FOR ALL TO authenticated
  USING (
    seating_id IN (
      SELECT id FROM public.seating_arrangements sa
      WHERE is_org_member_for_event(sa.event_id)
    )
  );

-- ============================================================================
-- STEP 7: INSERT DEFAULT DATA
-- ============================================================================

-- Insert default wedding task templates
INSERT INTO public.task_templates (template_name, title, description, category, priority, days_before_wedding) VALUES
  ('indian_wedding', 'Book wedding venue', 'Finalize and book the main wedding venue', 'venue', 'high', 180),
  ('indian_wedding', 'Hire wedding planner', 'Interview and hire a wedding planner if needed', 'planning', 'medium', 180),
  ('indian_wedding', 'Set wedding budget', 'Finalize total budget and allocate to categories', 'budget', 'high', 170),
  ('indian_wedding', 'Book photographer', 'Shortlist and book wedding photographer', 'vendor', 'high', 150),
  ('indian_wedding', 'Book videographer', 'Book professional videographer for wedding', 'vendor', 'high', 150),
  ('indian_wedding', 'Book caterer', 'Finalize catering vendor for all events', 'vendor', 'high', 120),
  ('indian_wedding', 'Send save-the-dates', 'Send save-the-date cards to guests', 'guests', 'medium', 120),
  ('indian_wedding', 'Book decorator', 'Hire decorator for all venues', 'vendor', 'high', 100),
  ('indian_wedding', 'Book mehendi artist', 'Book mehendi artist for bride and family', 'vendor', 'medium', 90),
  ('indian_wedding', 'Book makeup artist', 'Book bridal makeup artist', 'vendor', 'high', 90),
  ('indian_wedding', 'Order wedding invitations', 'Design and order physical invitations', 'guests', 'medium', 75),
  ('indian_wedding', 'Book pandit/priest', 'Confirm pandit for wedding ceremony', 'ceremony', 'high', 60),
  ('indian_wedding', 'Send wedding invitations', 'Mail out wedding invitations', 'guests', 'high', 60),
  ('indian_wedding', 'Book DJ/band', 'Hire entertainment for sangeet/reception', 'vendor', 'medium', 60),
  ('indian_wedding', 'Arrange guest accommodations', 'Block hotel rooms for outstation guests', 'logistics', 'high', 45),
  ('indian_wedding', 'Plan transportation', 'Arrange vehicles for guests and wedding party', 'logistics', 'medium', 45),
  ('indian_wedding', 'Finalize menu', 'Confirm final menu with caterer', 'vendor', 'high', 30),
  ('indian_wedding', 'Bridal outfit fitting', 'Final fitting for bridal outfit', 'attire', 'high', 21),
  ('indian_wedding', 'Groom outfit fitting', 'Final fitting for groom outfit', 'attire', 'high', 21),
  ('indian_wedding', 'Collect RSVPs', 'Follow up on pending RSVPs', 'guests', 'high', 21),
  ('indian_wedding', 'Create seating chart', 'Finalize guest seating arrangement', 'guests', 'medium', 14),
  ('indian_wedding', 'Confirm all vendors', 'Final confirmation with all vendors', 'vendor', 'high', 14),
  ('indian_wedding', 'Prepare wedding favors', 'Package guest return gifts', 'gifts', 'low', 10),
  ('indian_wedding', 'Brief wedding party', 'Meeting with bridesmaids/groomsmen', 'planning', 'medium', 7),
  ('indian_wedding', 'Final venue walkthrough', 'Visit venue for final checks', 'venue', 'high', 7),
  ('indian_wedding', 'Pack for honeymoon', 'Prepare luggage for honeymoon', 'personal', 'low', 3),
  ('indian_wedding', 'Rehearsal dinner', 'Host rehearsal dinner if applicable', 'events', 'medium', 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to increment photo likes
CREATE OR REPLACE FUNCTION increment_photo_likes(photo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.event_photos
  SET likes_count = likes_count + 1
  WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! All tables created successfully.
-- ============================================================================

SELECT 'EventKaro Master Schema applied successfully!' as status;
