-- ============================================
-- NUCLEAR FIX: Complete RLS Reset and Setup
-- Run this ENTIRE file in one go
-- ============================================

-- Step 1: Drop ALL existing policies on wedding_events
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'wedding_events'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON wedding_events';
  END LOOP;
END $$;

-- Step 2: Create new policies with proper WITH CHECK

-- SELECT Policy
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

-- INSERT Policy (THIS IS THE CRITICAL ONE)
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

-- UPDATE Policy
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

-- DELETE Policy
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

-- Step 3: Verify policies were created
SELECT
  policyname,
  cmd,
  CASE
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK'
    ELSE 'USING only'
  END as status
FROM pg_policies
WHERE tablename = 'wedding_events'
ORDER BY policyname;

-- You should see 4 policies!

-- Step 4: Check your setup
SELECT
  'Your User ID:' as info,
  auth.uid()::text as value
UNION ALL
SELECT
  'Organizations Count:' as info,
  COUNT(*)::text as value
FROM organization_members
WHERE user_id = auth.uid()
UNION ALL
SELECT
  'Wedding Events Count:' as info,
  COUNT(*)::text as value
FROM events
WHERE event_type = 'wedding'
AND organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
);

-- If "Organizations Count" = 0, run the next section
-- If "Wedding Events Count" = 0, run the section after that

-- ============================================
-- OPTIONAL: Create Organization (if needed)
-- Only run this if "Organizations Count" = 0 above
-- ============================================

/*
DO $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization
  INSERT INTO organizations (name, slug)
  VALUES ('My Wedding Planning', 'my-wedding-' || floor(random() * 10000))
  RETURNING id INTO new_org_id;

  -- Add current user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, auth.uid(), 'owner');

  RAISE NOTICE 'Created organization: %', new_org_id;
END $$;
*/

-- ============================================
-- OPTIONAL: Create Wedding Event (if needed)
-- Only run this if "Wedding Events Count" = 0 above
-- ============================================

/*
DO $$
DECLARE
  user_org_id UUID;
  new_event_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF user_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found. Run the organization creation section first.';
  END IF;

  -- Create wedding event
  INSERT INTO events (
    organization_id,
    title,
    slug,
    event_type,
    start_date,
    end_date,
    venue_type
  )
  VALUES (
    user_org_id,
    'Our Wedding',
    'our-wedding-' || floor(random() * 10000),
    'wedding',
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '60 days' + INTERVAL '12 hours',
    'physical'
  )
  RETURNING id INTO new_event_id;

  RAISE NOTICE 'Created wedding event: %', new_event_id;
END $$;
*/

-- ============================================
-- FINAL VERIFICATION
-- ============================================

SELECT
  'Setup Status' as check_name,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'wedding_events') = 4 THEN '✅'
    ELSE '❌ Policies not created'
  END as policies,
  CASE
    WHEN EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid()) THEN '✅'
    ELSE '❌ No organization'
  END as organization,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM events
      WHERE event_type = 'wedding'
      AND organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    ) THEN '✅'
    ELSE '❌ No wedding event'
  END as wedding_event;

-- ALL THREE should show ✅ before the app will work!
