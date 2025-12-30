-- Comprehensive fix for wedding_events access
-- This migration ensures wedding_events table is accessible

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Org members can manage wedding events" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_select_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_insert_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_update_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_delete_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_select" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_insert" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_update" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_delete" ON wedding_events;

-- ============================================
-- STEP 2: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE SIMPLIFIED POLICIES
-- ============================================

-- SELECT: Allow authenticated users to select wedding events for events they can access
CREATE POLICY "wedding_events_select"
  ON wedding_events FOR SELECT
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT: Allow authenticated users to insert wedding events for their events
CREATE POLICY "wedding_events_insert"
  ON wedding_events FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE: Allow authenticated users to update wedding events for their events
CREATE POLICY "wedding_events_update"
  ON wedding_events FOR UPDATE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- DELETE: Allow authenticated users to delete wedding events for their events
CREATE POLICY "wedding_events_delete"
  ON wedding_events FOR DELETE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- STEP 4: GRANT TABLE PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_events TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
