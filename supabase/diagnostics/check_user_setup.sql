-- ============================================
-- DIAGNOSTIC: Check Current User & Organization Setup
-- Run this FIRST to see if you have proper access
-- ============================================

-- 1. Check your current user
SELECT
  auth.uid() as my_user_id,
  email,
  created_at
FROM auth.users
WHERE id = auth.uid();

-- 2. Check if you have an organization
SELECT
  om.organization_id,
  om.role,
  o.name as org_name,
  o.owner_id,
  o.created_at
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = auth.uid();

-- 3. Check if you have any events
SELECT
  e.id,
  e.title,
  e.event_type,
  e.organization_id,
  o.name as org_name
FROM events e
JOIN organizations o ON e.organization_id = o.id
WHERE e.organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
);

-- 4. Check existing RLS policies on wedding_events
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'wedding_events';

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Query 1: Should show your email and user ID
-- Query 2: Should show at least 1 organization with role 'owner' or 'admin'
-- Query 3: Should show at least 1 wedding event
-- Query 4: Should show OLD policies (that's why we need the fix!)
