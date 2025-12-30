# 🚨 APPLY RLS FIX NOW - Step by Step Guide

You're getting `permission denied for table wedding_events` because the database migration **hasn't been applied yet**.

## ⚡ Quick Fix (5 Minutes)

### **Step 1: Open Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your EventKaro project
3. Click **SQL Editor** in the left sidebar

---

### **Step 2: Run Diagnostic Check (Optional but Recommended)**

Copy and paste this SQL to check your setup:

```sql
-- Check your user and organization
SELECT
  auth.uid() as my_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as my_email,
  (SELECT COUNT(*) FROM organization_members WHERE user_id = auth.uid()) as my_orgs,
  (SELECT COUNT(*) FROM events WHERE organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )) as my_events;
```

**Expected Result:**
```
my_user_id  | my_email           | my_orgs | my_events
------------|--------------------|---------|-----------
<uuid>      | your@email.com     | 1       | 1 or more
```

**If `my_orgs` is 0**, you need to create an organization first:
```sql
-- Create organization
INSERT INTO organizations (name, owner_id)
VALUES ('My Wedding', auth.uid())
RETURNING id;

-- Add yourself as owner (use the ID from above)
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('PASTE_ORG_ID_HERE', auth.uid(), 'owner');
```

**If `my_events` is 0**, you need to create an event:
```sql
-- Create a wedding event (use your org ID from above)
INSERT INTO events (organization_id, title, event_type, start_date, end_date)
VALUES (
  'PASTE_ORG_ID_HERE',
  'Our Wedding',
  'wedding',
  '2025-02-18',
  '2025-02-18'
)
RETURNING id;
```

---

### **Step 3: Apply the RLS Migration**

**Open this file in your code editor:**
```
supabase/migrations/20241230050000_fix_wedding_events_rls.sql
```

**Copy ALL 231 lines** (the entire file)

**Paste into Supabase SQL Editor**

**Click "RUN"** ▶️

**Expected Output:**
```
Success. No rows returned
```

---

### **Step 4: Verify the Fix**

Run this query to confirm policies are created:

```sql
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
```

**Expected Output:**
```
policyname                        | operation | insert_check
----------------------------------|-----------|------------------
wedding_events_delete_policy      | DELETE    | Only USING
wedding_events_insert_policy      | INSERT    | ✅ Has WITH CHECK
wedding_events_select_policy      | SELECT    | Only USING
wedding_events_update_policy      | UPDATE    | ✅ Has WITH CHECK
```

**You MUST see 4 policies with the exact names above!**

---

### **Step 5: Test in Your App**

1. **Refresh your EventKaro app** (hard refresh: Ctrl+Shift+R)
2. **Go to Events & Timeline**
3. **Click "Create Wedding Timeline"**
4. **Select "Wedding" event** (pre-checked)
5. **Click "Create Wedding Timeline" button**
6. **Should work now!** ✅

---

## 🔴 Still Getting Errors?

### **Error: "permission denied" still appears**

**Cause:** Migration wasn't applied or didn't run successfully

**Fix:**
1. Check Step 4 verification - do you see exactly 4 policies?
2. If not, the migration didn't run. Try running it again.
3. Check Supabase logs: Dashboard → Logs → Database

---

### **Error: "Could not find organization_id column"**

**Cause:** You're on old code

**Fix:**
1. Pull latest code: `git pull origin claude/fix-rsvp-vendor-placement-XcqrB`
2. Restart your dev server: `npm run dev`

---

### **Error: Different error about organizations**

**Cause:** User doesn't have organization membership

**Fix:** Run the diagnostic check from Step 2 and create organization if needed

---

## 📋 What Changed

**Before (Broken):**
```sql
CREATE POLICY "Org members can manage wedding events"
  ON wedding_events FOR ALL
  USING (...);  -- ❌ No WITH CHECK for INSERT
```

**After (Fixed):**
```sql
CREATE POLICY "wedding_events_insert_policy"
  ON wedding_events FOR INSERT
  WITH CHECK (...);  -- ✅ Proper WITH CHECK clause
```

**Why This Matters:**
- INSERT operations need `WITH CHECK` to validate new rows
- `FOR ALL` with only `USING` doesn't provide `WITH CHECK`
- Without `WITH CHECK`, PostgreSQL denies all INSERTs
- Now split into 4 granular policies (SELECT, INSERT, UPDATE, DELETE)

---

## 🎯 Summary

1. ✅ Open Supabase SQL Editor
2. ✅ Copy `/supabase/migrations/20241230050000_fix_wedding_events_rls.sql`
3. ✅ Paste and Run
4. ✅ Verify 4 policies exist
5. ✅ Refresh app and test

**The migration is production-ready and will fix the permission error immediately!**

---

## Need More Help?

If you're still stuck after following all steps:

1. **Check browser console** for detailed error messages
2. **Check Supabase logs:** Dashboard → Logs → Database
3. **Verify your auth.uid():** Run `SELECT auth.uid();` in SQL Editor
4. **Share the error:** Copy the exact error message from console

The fix is ready - it just needs to be applied to your database! 🚀
