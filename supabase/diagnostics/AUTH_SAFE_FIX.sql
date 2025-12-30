-- ============================================
-- CRITICAL FIX: Check Authentication First
-- ============================================

-- Step 1: Verify you're authenticated
SELECT
  auth.uid() as my_user_id,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED - You must be logged in!'
    ELSE '✅ Authenticated'
  END as auth_status;

-- If you see "NOT AUTHENTICATED", you need to:
-- 1. Make sure you're logged into Supabase
-- 2. Run queries from the SQL Editor (not external tool)
-- 3. Check that your project is using the correct auth setup

-- ============================================
-- Step 2: If authenticated, drop old policies
-- ============================================

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'wedding_events'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON wedding_events';
  END LOOP;
END $$;

-- ============================================
-- Step 3: Create new policies
-- ============================================

CREATE POLICY "wedding_events_select_policy"
  ON wedding_events FOR SELECT TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_events_insert_policy"
  ON wedding_events FOR INSERT TO authenticated
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "wedding_events_update_policy"
  ON wedding_events FOR UPDATE TO authenticated
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

CREATE POLICY "wedding_events_delete_policy"
  ON wedding_events FOR DELETE TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- Step 4: Verify policies exist
-- ============================================

SELECT
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'wedding_events'
ORDER BY policyname;

-- Should show 4 policies

-- ============================================
-- Step 5: Check your current setup
-- THIS WILL ONLY WORK IF YOU'RE AUTHENTICATED
-- ============================================

SELECT
  auth.uid() as my_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as my_email,
  (
    SELECT COUNT(*)
    FROM organization_members
    WHERE user_id = auth.uid()
  ) as my_organizations,
  (
    SELECT COUNT(*)
    FROM events
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ) as my_events;

-- ============================================
-- Step 6: Manual Organization Creation
-- ONLY RUN THIS SECTION IF my_organizations = 0
-- You MUST replace YOUR_USER_ID with your actual ID from Step 5
-- ============================================

/*
-- First, get your user ID from Step 5 above, then replace below
DO $$
DECLARE
  new_org_id UUID;
  target_user_id UUID := 'YOUR_USER_ID_HERE'::uuid;  -- REPLACE THIS!
BEGIN
  -- Create organization
  INSERT INTO organizations (name, slug)
  VALUES ('My Wedding Planning', 'wedding-' || floor(random() * 100000))
  RETURNING id INTO new_org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, target_user_id, 'owner');

  RAISE NOTICE 'Created organization: %', new_org_id;
END $$;
*/

-- ============================================
-- Step 7: Manual Event Creation
-- ONLY RUN THIS SECTION IF my_events = 0
-- You MUST replace YOUR_ORG_ID with your org ID
-- ============================================

/*
-- Get your org ID first:
SELECT organization_id FROM organization_members WHERE user_id = auth.uid();

-- Then replace YOUR_ORG_ID below:
DO $$
DECLARE
  new_event_id UUID;
  target_org_id UUID := 'YOUR_ORG_ID_HERE'::uuid;  -- REPLACE THIS!
BEGIN
  INSERT INTO events (
    organization_id, title, slug, event_type,
    start_date, end_date, venue_type
  )
  VALUES (
    target_org_id,
    'Our Wedding',
    'our-wedding-' || floor(random() * 100000),
    'wedding',
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '60 days' + INTERVAL '12 hours',
    'physical'
  )
  RETURNING id INTO new_event_id;

  RAISE NOTICE 'Created event: %', new_event_id;
END $$;
*/
