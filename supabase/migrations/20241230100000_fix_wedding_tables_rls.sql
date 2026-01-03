-- Fix RLS policies for wedding_family_groups and related tables
-- These tables have RLS enabled but no policies, blocking all access

-- ============================================
-- WEDDING_FAMILY_GROUPS POLICIES
-- ============================================

-- Drop any existing policies first
DROP POLICY IF EXISTS "wedding_family_groups_select" ON wedding_family_groups;
DROP POLICY IF EXISTS "wedding_family_groups_insert" ON wedding_family_groups;
DROP POLICY IF EXISTS "wedding_family_groups_update" ON wedding_family_groups;
DROP POLICY IF EXISTS "wedding_family_groups_delete" ON wedding_family_groups;

-- SELECT: Org members can view family groups for their events
CREATE POLICY "wedding_family_groups_select"
  ON wedding_family_groups FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT: Org members can create family groups for their events
CREATE POLICY "wedding_family_groups_insert"
  ON wedding_family_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE: Org members can update family groups for their events
CREATE POLICY "wedding_family_groups_update"
  ON wedding_family_groups FOR UPDATE
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- DELETE: Org members can delete family groups for their events
CREATE POLICY "wedding_family_groups_delete"
  ON wedding_family_groups FOR DELETE
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- WEDDING_HOTEL_INVENTORY POLICIES
-- ============================================

DROP POLICY IF EXISTS "wedding_hotel_inventory_select" ON wedding_hotel_inventory;
DROP POLICY IF EXISTS "wedding_hotel_inventory_insert" ON wedding_hotel_inventory;
DROP POLICY IF EXISTS "wedding_hotel_inventory_update" ON wedding_hotel_inventory;
DROP POLICY IF EXISTS "wedding_hotel_inventory_delete" ON wedding_hotel_inventory;

CREATE POLICY "wedding_hotel_inventory_select"
  ON wedding_hotel_inventory FOR SELECT TO authenticated
  USING (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "wedding_hotel_inventory_insert"
  ON wedding_hotel_inventory FOR INSERT TO authenticated
  WITH CHECK (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "wedding_hotel_inventory_update"
  ON wedding_hotel_inventory FOR UPDATE TO authenticated
  USING (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "wedding_hotel_inventory_delete"
  ON wedding_hotel_inventory FOR DELETE TO authenticated
  USING (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- ============================================
-- WEDDING_ROOM_ASSIGNMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "wedding_room_assignments_select" ON wedding_room_assignments;
DROP POLICY IF EXISTS "wedding_room_assignments_insert" ON wedding_room_assignments;
DROP POLICY IF EXISTS "wedding_room_assignments_update" ON wedding_room_assignments;
DROP POLICY IF EXISTS "wedding_room_assignments_delete" ON wedding_room_assignments;

CREATE POLICY "wedding_room_assignments_select"
  ON wedding_room_assignments FOR SELECT TO authenticated
  USING (hotel_block_id IN (
    SELECT id FROM wedding_hotel_inventory WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "wedding_room_assignments_insert"
  ON wedding_room_assignments FOR INSERT TO authenticated
  WITH CHECK (hotel_block_id IN (
    SELECT id FROM wedding_hotel_inventory WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "wedding_room_assignments_update"
  ON wedding_room_assignments FOR UPDATE TO authenticated
  USING (hotel_block_id IN (
    SELECT id FROM wedding_hotel_inventory WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "wedding_room_assignments_delete"
  ON wedding_room_assignments FOR DELETE TO authenticated
  USING (hotel_block_id IN (
    SELECT id FROM wedding_hotel_inventory WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

-- ============================================
-- WEDDING_TRANSPORTATION_SCHEDULE POLICIES
-- ============================================

DROP POLICY IF EXISTS "wedding_transportation_schedule_select" ON wedding_transportation_schedule;
DROP POLICY IF EXISTS "wedding_transportation_schedule_insert" ON wedding_transportation_schedule;
DROP POLICY IF EXISTS "wedding_transportation_schedule_update" ON wedding_transportation_schedule;
DROP POLICY IF EXISTS "wedding_transportation_schedule_delete" ON wedding_transportation_schedule;

CREATE POLICY "wedding_transportation_schedule_select"
  ON wedding_transportation_schedule FOR SELECT TO authenticated
  USING (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "wedding_transportation_schedule_insert"
  ON wedding_transportation_schedule FOR INSERT TO authenticated
  WITH CHECK (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "wedding_transportation_schedule_update"
  ON wedding_transportation_schedule FOR UPDATE TO authenticated
  USING (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "wedding_transportation_schedule_delete"
  ON wedding_transportation_schedule FOR DELETE TO authenticated
  USING (event_id IN (
    SELECT e.id FROM events e
    WHERE e.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- ============================================
-- WEDDING_GUEST_TRANSPORT_ASSIGNMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "wedding_guest_transport_select" ON wedding_guest_transport_assignments;
DROP POLICY IF EXISTS "wedding_guest_transport_insert" ON wedding_guest_transport_assignments;
DROP POLICY IF EXISTS "wedding_guest_transport_update" ON wedding_guest_transport_assignments;
DROP POLICY IF EXISTS "wedding_guest_transport_delete" ON wedding_guest_transport_assignments;

CREATE POLICY "wedding_guest_transport_select"
  ON wedding_guest_transport_assignments FOR SELECT TO authenticated
  USING (schedule_id IN (
    SELECT id FROM wedding_transportation_schedule WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "wedding_guest_transport_insert"
  ON wedding_guest_transport_assignments FOR INSERT TO authenticated
  WITH CHECK (schedule_id IN (
    SELECT id FROM wedding_transportation_schedule WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "wedding_guest_transport_update"
  ON wedding_guest_transport_assignments FOR UPDATE TO authenticated
  USING (schedule_id IN (
    SELECT id FROM wedding_transportation_schedule WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "wedding_guest_transport_delete"
  ON wedding_guest_transport_assignments FOR DELETE TO authenticated
  USING (schedule_id IN (
    SELECT id FROM wedding_transportation_schedule WHERE event_id IN (
      SELECT e.id FROM events e
      WHERE e.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  ));

-- ============================================
-- GRANT TABLE PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_family_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_hotel_inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_room_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_transportation_schedule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wedding_guest_transport_assignments TO authenticated;
