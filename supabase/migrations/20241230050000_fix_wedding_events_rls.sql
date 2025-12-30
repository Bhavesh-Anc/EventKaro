-- Fix RLS policies for wedding_events tables
-- The original policies used FOR ALL with only USING clause
-- which doesn't work correctly for INSERT operations
-- This migration adds proper WITH CHECK clauses

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Org members can manage wedding events" ON wedding_events;
DROP POLICY IF EXISTS "Org members can manage guest assignments" ON wedding_event_guest_assignments;
DROP POLICY IF EXISTS "Org members can manage vendor assignments" ON wedding_event_vendor_assignments;
DROP POLICY IF EXISTS "Vendors can view their assignments" ON wedding_event_vendor_assignments;
DROP POLICY IF EXISTS "Org members can manage budgets" ON wedding_event_budgets;

-- ============================================
-- WEDDING EVENTS POLICIES
-- ============================================

-- SELECT: Org members can view wedding events
CREATE POLICY "Org members can view wedding events"
  ON wedding_events FOR SELECT
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- INSERT: Org members can create wedding events
CREATE POLICY "Org members can insert wedding events"
  ON wedding_events FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- UPDATE: Org members can update wedding events
CREATE POLICY "Org members can update wedding events"
  ON wedding_events FOR UPDATE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- DELETE: Org members can delete wedding events
CREATE POLICY "Org members can delete wedding events"
  ON wedding_events FOR DELETE
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- WEDDING EVENT GUEST ASSIGNMENTS POLICIES
-- ============================================

-- SELECT: Org members can view guest assignments
CREATE POLICY "Org members can view guest assignments"
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

-- INSERT: Org members can create guest assignments
CREATE POLICY "Org members can insert guest assignments"
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

-- UPDATE: Org members can update guest assignments
CREATE POLICY "Org members can update guest assignments"
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

-- DELETE: Org members can delete guest assignments
CREATE POLICY "Org members can delete guest assignments"
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

-- ============================================
-- WEDDING EVENT VENDOR ASSIGNMENTS POLICIES
-- ============================================

-- SELECT: Org members can view vendor assignments
CREATE POLICY "Org members can view vendor assignments"
  ON wedding_event_vendor_assignments FOR SELECT
  TO authenticated
  USING (
    wedding_event_id IN (
      SELECT we.id FROM wedding_events we
      JOIN events e ON we.parent_event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- INSERT: Org members can create vendor assignments
CREATE POLICY "Org members can insert vendor assignments"
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

-- UPDATE: Org members can update vendor assignments
CREATE POLICY "Org members can update vendor assignments"
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

-- DELETE: Org members can delete vendor assignments
CREATE POLICY "Org members can delete vendor assignments"
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

-- Vendors can view their own assignments
CREATE POLICY "Vendors can view own assignments"
  ON wedding_event_vendor_assignments FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- WEDDING EVENT BUDGETS POLICIES
-- ============================================

-- SELECT: Org members can view budgets
CREATE POLICY "Org members can view budgets"
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

-- INSERT: Org members can create budgets
CREATE POLICY "Org members can insert budgets"
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

-- UPDATE: Org members can update budgets
CREATE POLICY "Org members can update budgets"
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

-- DELETE: Org members can delete budgets
CREATE POLICY "Org members can delete budgets"
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
