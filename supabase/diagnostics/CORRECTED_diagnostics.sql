-- ============================================
-- STEP 1: Verify RLS Migration Was Applied
-- ============================================

SELECT
  policyname,
  cmd as operation,
  CASE
    WHEN with_check IS NOT NULL THEN '✅ Has WITH CHECK'
    ELSE 'Only USING'
  END as insert_check
FROM pg_policies
WHERE tablename = 'wedding_events'
ORDER BY policyname;

-- Expected: You should see 4 policies
-- ✅ wedding_events_delete_policy   | DELETE    | Only USING
-- ✅ wedding_events_insert_policy   | INSERT    | ✅ Has WITH CHECK  <-- This is critical!
-- ✅ wedding_events_select_policy   | SELECT    | Only USING
-- ✅ wedding_events_update_policy   | UPDATE    | ✅ Has WITH CHECK

-- ============================================
-- STEP 2: Check Your User Setup
-- ============================================

-- Your current user ID
SELECT auth.uid() as my_user_id;

-- Your email
SELECT email FROM auth.users WHERE id = auth.uid();

-- Your organizations
SELECT
  om.organization_id,
  om.role,
  o.name as org_name,
  o.created_at
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = auth.uid();

-- Your events
SELECT
  e.id as event_id,
  e.title,
  e.event_type,
  e.start_date,
  e.organization_id
FROM events e
WHERE e.organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
);

-- ============================================
-- STEP 3: Test Creating a Wedding Event
-- ============================================

-- First, get your wedding event ID
SELECT
  id as event_id,
  title,
  'Copy the event_id above and replace YOUR_EVENT_ID below' as instruction
FROM events
WHERE event_type = 'wedding'
AND organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
)
LIMIT 1;

-- ============================================
-- STEP 4: After copying event ID, run this test
-- Replace YOUR_EVENT_ID with actual UUID from Step 3
-- ============================================

/*
-- Uncomment and replace YOUR_EVENT_ID with actual UUID:

INSERT INTO wedding_events (
  parent_event_id,
  event_name,
  start_datetime,
  end_datetime,
  sequence_order,
  status
) VALUES (
  'YOUR_EVENT_ID'::uuid,  -- Replace with actual event ID from Step 3
  'wedding',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
  1,
  'planned'
) RETURNING id, event_name, start_datetime, 'Success! ✅' as result;

-- If this returns a row with an ID, the RLS fix worked!
-- If you get "permission denied", the RLS fix didn't apply correctly
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you have NO organizations (Step 2 returns empty):
/*
-- Create an organization
INSERT INTO organizations (name, slug)
VALUES ('My Wedding Planning', 'my-wedding-planning')
RETURNING id, name;

-- Note the returned ID, then add yourself as owner:
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('PASTE_ORG_ID_HERE'::uuid, auth.uid(), 'owner')
RETURNING *;
*/

-- If you have NO events (Step 2 shows org but no events):
/*
-- Create a wedding event (use your org_id from above)
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
  'PASTE_YOUR_ORG_ID_HERE'::uuid,
  'Our Wedding',
  'our-wedding-2025',
  'wedding',
  '2025-02-18 10:00:00+00',
  '2025-02-18 23:00:00+00',
  'physical'
)
RETURNING id, title, event_type;
*/
