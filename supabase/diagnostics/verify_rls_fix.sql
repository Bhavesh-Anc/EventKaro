-- ============================================
-- STEP 1: Apply the RLS Fix Migration
-- Copy and run the ENTIRE migration file first
-- ============================================

-- Location: supabase/migrations/20241230050000_fix_wedding_events_rls.sql
-- You need to run ALL 231 lines from that file

-- ============================================
-- STEP 2: Verify the Fix Was Applied
-- Run this AFTER applying the migration
-- ============================================

-- Check that new policies exist
SELECT
  policyname,
  cmd,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK ✅'
    ELSE 'No WITH CHECK'
  END as insert_check_status
FROM pg_policies
WHERE tablename = 'wedding_events'
ORDER BY policyname;

-- Expected output:
-- You should see 4 policies:
-- 1. wedding_events_delete_policy   (DELETE)
-- 2. wedding_events_insert_policy   (INSERT) - Has WITH CHECK ✅
-- 3. wedding_events_select_policy   (SELECT)
-- 4. wedding_events_update_policy   (UPDATE) - Has WITH CHECK ✅

-- ============================================
-- STEP 3: Test Permission (Run AFTER Step 2)
-- This simulates what your app is trying to do
-- ============================================

-- Get your parent event ID
SELECT id, title, event_type, organization_id
FROM events
WHERE event_type = 'wedding'
LIMIT 1;

-- Try to insert a test wedding event (replace the UUID below with your event ID from above)
INSERT INTO wedding_events (
  parent_event_id,
  event_name,
  start_datetime,
  end_datetime,
  sequence_order,
  status
) VALUES (
  'YOUR_EVENT_ID_HERE'::uuid,  -- Replace with actual event ID
  'wedding',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
  1,
  'planned'
) RETURNING id, event_name, start_datetime;

-- If this works, you'll see the new event ID returned ✅
-- If it fails, check the diagnostic queries from Step 1

-- ============================================
-- STEP 4: Cleanup Test Data (Optional)
-- If you created a test event above, delete it
-- ============================================

-- DELETE FROM wedding_events WHERE event_name = 'wedding' AND notes = 'test';
