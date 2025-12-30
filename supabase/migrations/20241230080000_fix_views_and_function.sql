-- Fix missing GRANT permissions on views and fix create_default_wedding_events function bug
-- This migration addresses:
-- 1. Missing GRANT SELECT on wedding_event_conflicts view
-- 2. Missing GRANT SELECT on wedding_vendor_conflicts view
-- 3. Bug in create_default_wedding_events function (parent_event_id vs parent_id typo)
-- 4. Re-enable RLS on wedding_events (if disabled during debugging)
-- 5. Fix foreign key references from vendor_profiles (VIEW) to vendors (TABLE)

-- ============================================
-- FIX FOREIGN KEY REFERENCES
-- ============================================

-- The wedding_event_vendor_assignments and wedding_event_budgets tables
-- were created with foreign keys to vendor_profiles, but vendor_profiles
-- is a VIEW over vendors table, not a table itself.
-- We need to drop and recreate these constraints to point to vendors table.

-- Drop the invalid foreign key constraints (if they exist)
ALTER TABLE IF EXISTS wedding_event_vendor_assignments
  DROP CONSTRAINT IF EXISTS wedding_event_vendor_assignments_vendor_id_fkey;

ALTER TABLE IF EXISTS wedding_event_budgets
  DROP CONSTRAINT IF EXISTS wedding_event_budgets_vendor_id_fkey;

-- Recreate the foreign key constraints pointing to vendors table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wedding_event_vendor_assignments') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'wedding_event_vendor_assignments' AND column_name = 'vendor_id') THEN
      ALTER TABLE wedding_event_vendor_assignments
        ADD CONSTRAINT wedding_event_vendor_assignments_vendor_id_fkey
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Constraint might already exist or table might not exist, that's okay
  RAISE NOTICE 'Could not add FK to wedding_event_vendor_assignments: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wedding_event_budgets') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'wedding_event_budgets' AND column_name = 'vendor_id') THEN
      ALTER TABLE wedding_event_budgets
        ADD CONSTRAINT wedding_event_budgets_vendor_id_fkey
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Constraint might already exist or table might not exist, that's okay
  RAISE NOTICE 'Could not add FK to wedding_event_budgets: %', SQLERRM;
END $$;

-- ============================================
-- GRANT PERMISSIONS ON VIEWS
-- ============================================

-- Grant SELECT on wedding_event_conflicts view (if it exists)
DO $$
BEGIN
  GRANT SELECT ON wedding_event_conflicts TO authenticated;
  GRANT SELECT ON wedding_event_conflicts TO anon;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not grant on wedding_event_conflicts: %', SQLERRM;
END $$;

-- Grant SELECT on wedding_vendor_conflicts view (if it exists)
DO $$
BEGIN
  GRANT SELECT ON wedding_vendor_conflicts TO authenticated;
  GRANT SELECT ON wedding_vendor_conflicts TO anon;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not grant on wedding_vendor_conflicts: %', SQLERRM;
END $$;

-- ============================================
-- FIX create_default_wedding_events FUNCTION
-- ============================================

-- The original function has a bug on line where reception is created
-- It uses parent_event_id instead of parent_id (the function parameter name)

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
  -- FIXED: was using parent_event_id instead of parent_id
  INSERT INTO wedding_events (parent_event_id, event_name, start_datetime, end_datetime, sequence_order)
  VALUES (
    parent_id,  -- FIXED: was parent_event_id
    'reception',
    (wedding_date + INTERVAL '1 day')::DATE + TIME '19:00',
    (wedding_date + INTERVAL '1 day')::DATE + TIME '23:00',
    base_sequence + 5
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_default_wedding_events(UUID, DATE) TO authenticated;

-- ============================================
-- ENSURE RLS IS ENABLED (re-enable if disabled during debugging)
-- ============================================

ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_event_guest_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_event_vendor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_event_budgets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION create_default_wedding_events IS 'Creates default wedding sub-events (engagement, mehendi, haldi, sangeet, wedding, reception) for a parent event';
