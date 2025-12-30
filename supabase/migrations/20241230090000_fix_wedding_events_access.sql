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

-- ============================================
-- STEP 2: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE SIMPLIFIED POLICIES
-- ============================================

-- The previous policies required complex joins through organization_members.
-- Let's create simpler policies that check event ownership more directly.

-- SELECT: Allow authenticated users to select wedding events for events they can access
CREATE POLICY "wedding_events_select"
  ON wedding_events FOR SELECT
  TO authenticated
  USING (
    -- User can see wedding events if they can see the parent event
    parent_event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
    OR
    -- Or if the parent event's organization owner matches the user
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- INSERT: Allow authenticated users to insert wedding events for their events
CREATE POLICY "wedding_events_insert"
  ON wedding_events FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
    OR
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- UPDATE: Allow authenticated users to update wedding events for their events
CREATE POLICY "wedding_events_update"
  ON wedding_events FOR UPDATE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
    OR
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    parent_event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
    OR
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- DELETE: Allow authenticated users to delete wedding events for their events
CREATE POLICY "wedding_events_delete"
  ON wedding_events FOR DELETE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
    OR
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organizations o ON e.organization_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 4: GRANT TABLE PERMISSIONS
-- ============================================

-- Ensure the authenticated role has base permissions on the table
GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_events TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- STEP 5: ENSURE USER IS IN ORGANIZATION_MEMBERS
-- ============================================

-- Auto-add organization owners to organization_members if not already there
INSERT INTO organization_members (organization_id, user_id, role)
SELECT o.id, o.owner_id, 'owner'
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_members om
  WHERE om.organization_id = o.id AND om.user_id = o.owner_id
)
ON CONFLICT DO NOTHING;
