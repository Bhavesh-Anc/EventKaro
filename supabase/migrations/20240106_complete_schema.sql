-- ============================================================================
-- EventKaro: Complete Database Schema for New Features
-- Run this ENTIRE file in Supabase SQL Editor (Project > SQL Editor)
-- This is a comprehensive migration - run it all at once
-- ============================================================================

-- ============================================================================
-- 1. TASKS TABLE (with all columns including notes & dependencies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  wedding_event_id UUID,
  vendor_id UUID,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  dependencies UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);

-- RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tasks for their organizations" ON public.tasks;
CREATE POLICY "Users can view tasks for their organizations" ON public.tasks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create tasks for their organizations" ON public.tasks;
CREATE POLICY "Users can create tasks for their organizations" ON public.tasks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tasks for their organizations" ON public.tasks;
CREATE POLICY "Users can update tasks for their organizations" ON public.tasks
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks for their organizations" ON public.tasks;
CREATE POLICY "Users can delete tasks for their organizations" ON public.tasks
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. TASK TEMPLATES TABLE
-- ============================================================================
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
-- 3. INVITATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'rsvp_completed')),
  sent_via TEXT CHECK (sent_via IN ('email', 'whatsapp', 'sms')),
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

-- Indexes for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_guest_id ON public.invitations(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- RLS for invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invitations for their events" ON public.invitations;
CREATE POLICY "Users can view invitations for their events" ON public.invitations
  FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage invitations for their events" ON public.invitations;
CREATE POLICY "Users can manage invitations for their events" ON public.invitations
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view invitations by token" ON public.invitations;
CREATE POLICY "Public can view invitations by token" ON public.invitations
  FOR SELECT USING (true);

-- ============================================================================
-- 4. EVENT PHOTOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('pre_wedding', 'mehendi', 'haldi', 'sangeet', 'wedding', 'reception', 'candid', 'group', 'couple', 'family', 'guests', 'decor', 'food', 'other')),
  uploaded_by TEXT DEFAULT 'host' CHECK (uploaded_by IN ('host', 'photographer', 'guest')),
  uploader_id UUID,
  uploader_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for photos
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON public.event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_category ON public.event_photos(category);
CREATE INDEX IF NOT EXISTS idx_event_photos_is_approved ON public.event_photos(is_approved);
CREATE INDEX IF NOT EXISTS idx_event_photos_is_featured ON public.event_photos(is_featured);

-- RLS for photos
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view approved photos" ON public.event_photos;
CREATE POLICY "Users can view approved photos" ON public.event_photos
  FOR SELECT USING (is_approved = true OR
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage photos for their events" ON public.event_photos;
CREATE POLICY "Users can manage photos for their events" ON public.event_photos
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can upload photos" ON public.event_photos;
CREATE POLICY "Anyone can upload photos" ON public.event_photos
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 5. PHOTO ALBUMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID REFERENCES public.event_photos(id) ON DELETE SET NULL,
  photo_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for albums
ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public albums" ON public.photo_albums;
CREATE POLICY "Users can view public albums" ON public.photo_albums
  FOR SELECT USING (is_public = true OR
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage albums for their events" ON public.photo_albums;
CREATE POLICY "Users can manage albums for their events" ON public.photo_albums
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. REMINDERS TABLE
-- ============================================================================
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

-- Indexes for reminders
CREATE INDEX IF NOT EXISTS idx_reminders_event_id ON public.reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON public.reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

-- RLS for reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage reminders for their events" ON public.reminders;
CREATE POLICY "Users can manage reminders for their events" ON public.reminders
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. RUNSHEET ITEMS TABLE
-- ============================================================================
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

-- Indexes for runsheet
CREATE INDEX IF NOT EXISTS idx_runsheet_items_event_id ON public.runsheet_items(event_id);
CREATE INDEX IF NOT EXISTS idx_runsheet_items_time ON public.runsheet_items(time);
CREATE INDEX IF NOT EXISTS idx_runsheet_items_wedding_event ON public.runsheet_items(wedding_event_id);

-- RLS for runsheet
ALTER TABLE public.runsheet_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage runsheet for their events" ON public.runsheet_items;
CREATE POLICY "Users can manage runsheet for their events" ON public.runsheet_items
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. EMERGENCY CONTACTS TABLE
-- ============================================================================
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_event_id ON public.emergency_contacts(event_id);

-- RLS for emergency contacts
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage emergency contacts for their events" ON public.emergency_contacts;
CREATE POLICY "Users can manage emergency contacts for their events" ON public.emergency_contacts
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. EVENT TEAM MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,
  name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'declined')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id),
  UNIQUE(event_id, invited_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_team_members_event_id ON public.event_team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_user_id ON public.event_team_members(user_id);

-- RLS for team members
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view team members" ON public.event_team_members;
CREATE POLICY "Users can view team members" ON public.event_team_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage team members" ON public.event_team_members;
CREATE POLICY "Admins can manage team members" ON public.event_team_members
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- 10. VENDOR AVAILABILITY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor ON public.vendor_availability(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date ON public.vendor_availability(date);

-- RLS for vendor availability
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage vendor availability" ON public.vendor_availability;
CREATE POLICY "Users can manage vendor availability" ON public.vendor_availability
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      JOIN public.events e ON v.event_id = e.id
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 11. TRANSPORTATION ROUTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transportation_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  wedding_event_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('bus', 'car', 'van', 'auto', 'tempo', 'other')),
  capacity INTEGER,
  pickup_location TEXT NOT NULL,
  pickup_time TIME,
  dropoff_location TEXT NOT NULL,
  dropoff_time TIME,
  driver_name TEXT,
  driver_phone TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transportation_routes_event ON public.transportation_routes(event_id);
CREATE INDEX IF NOT EXISTS idx_transportation_wedding_event ON public.transportation_routes(wedding_event_id);

-- RLS for transportation
ALTER TABLE public.transportation_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage transportation routes" ON public.transportation_routes;
CREATE POLICY "Users can manage transportation routes" ON public.transportation_routes
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 12. GUEST TRANSPORTATION ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guest_transportation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.transportation_routes(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  pickup_confirmed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, guest_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_transportation_route ON public.guest_transportation(route_id);
CREATE INDEX IF NOT EXISTS idx_guest_transportation_guest ON public.guest_transportation(guest_id);

-- RLS
ALTER TABLE public.guest_transportation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage guest transportation" ON public.guest_transportation;
CREATE POLICY "Users can manage guest transportation" ON public.guest_transportation
  FOR ALL USING (
    route_id IN (
      SELECT tr.id FROM public.transportation_routes tr
      JOIN public.events e ON tr.event_id = e.id
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 13. SEATING ARRANGEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seating_arrangements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  wedding_event_id UUID,
  name TEXT NOT NULL,
  table_number INTEGER,
  capacity INTEGER DEFAULT 10,
  category TEXT CHECK (category IN ('vip', 'family_bride', 'family_groom', 'friends', 'colleagues', 'general')),
  location_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seating_arrangements_event ON public.seating_arrangements(event_id);
CREATE INDEX IF NOT EXISTS idx_seating_wedding_event ON public.seating_arrangements(wedding_event_id);

-- RLS
ALTER TABLE public.seating_arrangements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage seating arrangements" ON public.seating_arrangements;
CREATE POLICY "Users can manage seating arrangements" ON public.seating_arrangements
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 14. GUEST SEATING ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guest_seating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_id UUID NOT NULL REFERENCES public.seating_arrangements(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  seat_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seating_id, guest_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_seating_arrangement ON public.guest_seating(seating_id);
CREATE INDEX IF NOT EXISTS idx_guest_seating_guest ON public.guest_seating(guest_id);

-- RLS
ALTER TABLE public.guest_seating ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage guest seating" ON public.guest_seating;
CREATE POLICY "Users can manage guest seating" ON public.guest_seating
  FOR ALL USING (
    seating_id IN (
      SELECT sa.id FROM public.seating_arrangements sa
      JOIN public.events e ON sa.event_id = e.id
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 15. WHATSAPP MESSAGE LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('invitation', 'reminder', 'update', 'thank_you', 'custom')),
  message_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_event ON public.whatsapp_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_guest ON public.whatsapp_messages(guest_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);

-- RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Users can manage whatsapp messages" ON public.whatsapp_messages
  FOR ALL USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 16. HELPER FUNCTIONS
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

-- Function to update task completion timestamp
CREATE OR REPLACE FUNCTION update_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task completion
DROP TRIGGER IF EXISTS task_completion_trigger ON public.tasks;
CREATE TRIGGER task_completion_trigger
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_completion();

-- ============================================================================
-- 17. ADD COLUMNS TO EXISTING TABLES (IF THEY EXIST)
-- ============================================================================

-- Add wedding_events relation columns if wedding_events table exists
DO $$
BEGIN
  -- Add columns to wedding_events if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wedding_events') THEN
    BEGIN
      ALTER TABLE public.wedding_events ADD COLUMN IF NOT EXISTS venue_address TEXT;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.wedding_events ADD COLUMN IF NOT EXISTS dress_code TEXT;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.wedding_events ADD COLUMN IF NOT EXISTS meal_type TEXT;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- Add columns to vendors if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
    BEGIN
      ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[];
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- Add columns to guests if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guests') THEN
    BEGIN
      ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS accommodation_required BOOLEAN DEFAULT false;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS transportation_required BOOLEAN DEFAULT false;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS arrival_date DATE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS departure_date DATE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- DONE! All tables and features have been created successfully.
-- ============================================================================
