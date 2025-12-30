-- Fix wedding_events RLS policies for INSERT operations
-- The issue: FOR ALL with only USING clause doesn't work properly for INSERTs
-- Solution: Split into separate policies for different operations

-- Drop existing policy
DROP POLICY IF EXISTS "Org members can manage wedding events" ON wedding_events;

-- Create separate policies for each operation

-- SELECT policy
CREATE POLICY "wedding_events_select_policy"
  ON wedding_events FOR SELECT
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- INSERT policy with WITH CHECK clause
CREATE POLICY "wedding_events_insert_policy"
  ON wedding_events FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- UPDATE policy
CREATE POLICY "wedding_events_update_policy"
  ON wedding_events FOR UPDATE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- DELETE policy
CREATE POLICY "wedding_events_delete_policy"
  ON wedding_events FOR DELETE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Also fix the guest assignments, vendor assignments, and budgets tables
-- These also use FOR ALL without proper WITH CHECK

-- Guest assignments
DROP POLICY IF EXISTS "Org members can manage guest assignments" ON wedding_event_guest_assignments;

CREATE POLICY "wedding_event_guest_assignments_select"
  ON wedding_event_guest_assignments FOR SELECT
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_guest_assignments_insert"
  ON wedding_event_guest_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_guest_assignments_update"
  ON wedding_event_guest_assignments FOR UPDATE
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_guest_assignments_delete"
  ON wedding_event_guest_assignments FOR DELETE
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Vendor assignments
DROP POLICY IF EXISTS "Org members can manage vendor assignments" ON wedding_event_vendor_assignments;

CREATE POLICY "wedding_event_vendor_assignments_select"
  ON wedding_event_vendor_assignments FOR SELECT
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
    OR vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_vendor_assignments_insert"
  ON wedding_event_vendor_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_vendor_assignments_update"
  ON wedding_event_vendor_assignments FOR UPDATE
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_vendor_assignments_delete"
  ON wedding_event_vendor_assignments FOR DELETE
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Drop the separate vendor view policy since it's now merged into SELECT
DROP POLICY IF EXISTS "Vendors can view their assignments" ON wedding_event_vendor_assignments;

-- Budget policies
DROP POLICY IF EXISTS "Org members can manage budgets" ON wedding_event_budgets;

CREATE POLICY "wedding_event_budgets_select"
  ON wedding_event_budgets FOR SELECT
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_budgets_insert"
  ON wedding_event_budgets FOR INSERT
  TO authenticated
  WITH CHECK (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_budgets_update"
  ON wedding_event_budgets FOR UPDATE
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_event_budgets_delete"
  ON wedding_event_budgets FOR DELETE
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON POLICY "wedding_events_insert_policy" ON wedding_events IS 'Allow organization members to create wedding sub-events';
COMMENT ON POLICY "wedding_events_select_policy" ON wedding_events IS 'Allow organization members to view wedding sub-events';
COMMENT ON POLICY "wedding_events_update_policy" ON wedding_events IS 'Allow organization members to update wedding sub-events';
COMMENT ON POLICY "wedding_events_delete_policy" ON wedding_events IS 'Allow organization members to delete wedding sub-events';
