-- Add missing columns to wedding_events and related tables
-- These columns are expected by the application but missing from the original schema

-- ============================================
-- ADD MISSING COLUMNS TO WEDDING_EVENTS
-- ============================================

-- Add venue_type column for categorizing venue
ALTER TABLE wedding_events ADD COLUMN IF NOT EXISTS venue_type TEXT;

-- Add guest_subset column for defining which guests attend this event
ALTER TABLE wedding_events ADD COLUMN IF NOT EXISTS guest_subset TEXT;

-- Add color_theme column (single value complement to theme_colors array)
ALTER TABLE wedding_events ADD COLUMN IF NOT EXISTS color_theme TEXT;

-- Add transport_required column
ALTER TABLE wedding_events ADD COLUMN IF NOT EXISTS transport_required BOOLEAN DEFAULT FALSE;

-- ============================================
-- ADD MISSING COLUMNS TO VENDOR ASSIGNMENTS
-- ============================================

-- Add status column for tracking vendor assignment status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wedding_event_vendor_assignments' AND column_name = 'status'
  ) THEN
    ALTER TABLE wedding_event_vendor_assignments ADD COLUMN status TEXT DEFAULT 'pending';
    ALTER TABLE wedding_event_vendor_assignments ADD CONSTRAINT wedding_event_vendor_assignments_status_check
      CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));
  END IF;
END $$;

-- Add scope column (shorter alias for scope_of_work)
ALTER TABLE wedding_event_vendor_assignments ADD COLUMN IF NOT EXISTS scope TEXT;

-- ============================================
-- ADD MISSING COLUMNS TO BUDGETS
-- ============================================

-- Add allocated_amount (for simpler access, maps to planned_amount_inr)
ALTER TABLE wedding_event_budgets ADD COLUMN IF NOT EXISTS allocated_amount INTEGER DEFAULT 0;

-- Add spent_amount (for simpler access, maps to paid_amount_inr)
ALTER TABLE wedding_event_budgets ADD COLUMN IF NOT EXISTS spent_amount INTEGER DEFAULT 0;

-- Add committed_amount (for simpler access, maps to committed_amount_inr)
ALTER TABLE wedding_event_budgets ADD COLUMN IF NOT EXISTS committed_amount INTEGER DEFAULT 0;

-- ============================================
-- ADD INDEXES FOR NEW COLUMNS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_wedding_events_transport ON wedding_events(parent_event_id, transport_required) WHERE transport_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_wedding_vendor_status ON wedding_event_vendor_assignments(status);
