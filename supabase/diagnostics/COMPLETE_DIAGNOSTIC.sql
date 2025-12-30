-- ============================================
-- COMPLETE DIAGNOSTIC - Run Each Section Separately
-- Copy and paste each section one at a time
-- ============================================

-- ============================================
-- SECTION 1: Check if RLS policies exist
-- ============================================

SELECT
  tablename,
  policyname,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE tablename = 'wedding_events'
ORDER BY policyname;

-- EXPECTED OUTPUT: 4 rows
-- If you see 0 rows, the migration didn't run
-- If you see 1 row named "Org members can manage wedding events", the old policy is still there

-- ============================================
-- SECTION 2: Check your user ID
-- ============================================

SELECT auth.uid() as my_user_id;

-- Copy this UUID, you'll need it below

-- ============================================
-- SECTION 3: Check if you're in an organization
-- ============================================

SELECT
  om.id,
  om.organization_id,
  om.user_id,
  om.role,
  o.name as org_name
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = auth.uid();

-- If this returns EMPTY (0 rows), you need to create an organization
-- Copy the organization_id if it shows a row

-- ============================================
-- SECTION 4: Check if you have a wedding event
-- ============================================

SELECT
  e.id as event_id,
  e.title,
  e.event_type,
  e.organization_id,
  o.name as org_name
FROM events e
JOIN organizations o ON e.organization_id = o.id
WHERE e.organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
)
AND e.event_type = 'wedding';

-- If this returns EMPTY, you need to create a wedding event
-- Copy the event_id if it shows a row

-- ============================================
-- SECTION 5: Test the policy directly
-- This will tell us EXACTLY why it's failing
-- ============================================

-- First, let's see what the policy check returns
SELECT
  parent_event_id,
  'This event should be allowed' as status
FROM (
  SELECT e.id as parent_event_id
  FROM events e
  JOIN organization_members om ON e.organization_id = om.organization_id
  WHERE om.user_id = auth.uid()
  AND e.event_type = 'wedding'
  LIMIT 1
) allowed_events;

-- If this returns 0 rows, the policy can't find your event
-- This means either:
-- 1. You don't have an organization_member record
-- 2. You don't have an event
-- 3. The event's organization_id doesn't match your organization_member record

-- ============================================
-- SECTION 6: Check table permissions
-- ============================================

SELECT
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE tablename = 'wedding_events') as policy_count
FROM pg_tables
WHERE tablename = 'wedding_events';

-- EXPECTED: rls_enabled = true, policy_count = 4
-- If policy_count = 0, migration didn't run
-- If policy_count = 1, old policy still there

-- ============================================
-- SECTION 7: Raw auth check
-- ============================================

-- Check if auth.uid() is actually working
SELECT
  auth.uid() as uid,
  auth.uid() IS NOT NULL as is_authenticated,
  current_user as database_user;

-- EXPECTED:
-- uid = some UUID
-- is_authenticated = true
-- database_user = authenticator or similar
