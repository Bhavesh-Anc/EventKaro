-- ============================================================================
-- EventKaro: Fix All Missing Dependencies
-- Run this file FIRST before running 20240106_complete_schema.sql
-- This ensures all prerequisite tables and columns exist
-- ============================================================================

-- ============================================================================
-- 1. ENSURE wedding_events TABLE EXISTS
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wedding_events') THEN
    CREATE TABLE public.wedding_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
      event_name TEXT NOT NULL CHECK (event_name IN (
        'engagement', 'mehendi', 'haldi', 'sangeet', 'wedding', 'reception', 'custom'
      )),
      custom_event_name TEXT,
      description TEXT,
      start_datetime TIMESTAMPTZ NOT NULL,
      end_datetime TIMESTAMPTZ NOT NULL,
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
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (end_datetime > start_datetime)
    );

    CREATE INDEX IF NOT EXISTS idx_wedding_events_parent ON public.wedding_events(parent_event_id);
    CREATE INDEX IF NOT EXISTS idx_wedding_events_datetime ON public.wedding_events(start_datetime);

    ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Org members can manage wedding events" ON public.wedding_events
      FOR ALL TO authenticated
      USING (
        parent_event_id IN (
          SELECT e.id FROM public.events e
          JOIN public.organization_members om ON e.organization_id = om.organization_id
          WHERE om.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 2. ENSURE guest_event_rsvp TABLE EXISTS
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_event_rsvp') THEN
    CREATE TABLE public.guest_event_rsvp (
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

    ALTER TABLE public.guest_event_rsvp ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view guest event rsvp" ON public.guest_event_rsvp
      FOR SELECT TO authenticated
      USING (
        wedding_event_id IN (
          SELECT we.id FROM public.wedding_events we
          JOIN public.events e ON we.parent_event_id = e.id
          JOIN public.organization_members om ON e.organization_id = om.organization_id
          WHERE om.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can manage guest event rsvp" ON public.guest_event_rsvp
      FOR ALL TO authenticated
      USING (
        wedding_event_id IN (
          SELECT we.id FROM public.wedding_events we
          JOIN public.events e ON we.parent_event_id = e.id
          JOIN public.organization_members om ON e.organization_id = om.organization_id
          WHERE om.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 3. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add columns to guests table if they don't exist
DO $$
BEGIN
  -- Relationship columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'relationship') THEN
    ALTER TABLE public.guests ADD COLUMN relationship TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'relationship_detail') THEN
    ALTER TABLE public.guests ADD COLUMN relationship_detail TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'age_group') THEN
    ALTER TABLE public.guests ADD COLUMN age_group TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'priority') THEN
    ALTER TABLE public.guests ADD COLUMN priority TEXT DEFAULT 'standard';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'invitation_wave') THEN
    ALTER TABLE public.guests ADD COLUMN invitation_wave INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'reminder_count') THEN
    ALTER TABLE public.guests ADD COLUMN reminder_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE public.guests ADD COLUMN whatsapp_number TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'preferred_contact') THEN
    ALTER TABLE public.guests ADD COLUMN preferred_contact TEXT DEFAULT 'email';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'notes') THEN
    ALTER TABLE public.guests ADD COLUMN notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'dietary_restrictions') THEN
    ALTER TABLE public.guests ADD COLUMN dietary_restrictions TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'accommodation_required') THEN
    ALTER TABLE public.guests ADD COLUMN accommodation_required BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'transportation_required') THEN
    ALTER TABLE public.guests ADD COLUMN transportation_required BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'arrival_date') THEN
    ALTER TABLE public.guests ADD COLUMN arrival_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'departure_date') THEN
    ALTER TABLE public.guests ADD COLUMN departure_date DATE;
  END IF;
END $$;

-- ============================================================================
-- 4. ENSURE vendors TABLE HAS NEEDED COLUMNS
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'rating') THEN
      ALTER TABLE public.vendors ADD COLUMN rating DECIMAL(3,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'review_count') THEN
      ALTER TABLE public.vendors ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'portfolio_urls') THEN
      ALTER TABLE public.vendors ADD COLUMN portfolio_urls TEXT[];
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE update_updated_at_column FUNCTION IF NOT EXISTS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! Now you can run 20240106_complete_schema.sql
-- ============================================================================
SELECT 'Dependencies fixed successfully! Now run 20240106_complete_schema.sql' as message;
