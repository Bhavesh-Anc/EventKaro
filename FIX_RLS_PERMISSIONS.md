# Fix: Wedding Events Permission Denied Error

## The Problem

You're getting this error when trying to create wedding events:
```
Error: permission denied for table wedding_events
Code: 42501
```

## Root Cause

The Supabase RLS (Row Level Security) policy for `wedding_events` was using `FOR ALL` with only a `USING` clause. This doesn't work properly for `INSERT` operations because:

1. `INSERT` operations need a `WITH CHECK` clause to validate new rows
2. `FOR ALL` policies with only `USING` don't automatically provide `WITH CHECK`
3. Without `WITH CHECK`, the database denies all INSERT attempts

## The Fix

### Option 1: Run Migration via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard** → Go to your project
2. **Click on SQL Editor** (left sidebar)
3. **Copy and paste** the SQL from the file:
   ```
   supabase/migrations/20241230050000_fix_wedding_events_rls.sql
   ```
4. **Click "Run"** to execute the migration
5. **Verify success** - You should see "Success. No rows returned"

### Option 2: Use Supabase CLI (If Installed)

If you have Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 3: Quick Fix SQL (Copy-Paste Ready)

If you want to quickly test, run this SQL in Supabase SQL Editor:

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Org members can manage wedding events" ON wedding_events;

-- Create INSERT policy with WITH CHECK
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

-- Create SELECT policy
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

-- Create UPDATE policy
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

-- Create DELETE policy
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
```

## What Changed

**Before:**
```sql
CREATE POLICY "Org members can manage wedding events"
  ON wedding_events FOR ALL  -- ❌ Single policy for everything
  TO authenticated
  USING (...);  -- ❌ Only USING, no WITH CHECK
```

**After:**
```sql
-- ✅ Separate policies for each operation
CREATE POLICY "wedding_events_insert_policy"
  ON wedding_events FOR INSERT
  WITH CHECK (...);  -- ✅ WITH CHECK for INSERT

CREATE POLICY "wedding_events_select_policy"
  FOR SELECT
  USING (...);  -- ✅ USING for SELECT

CREATE POLICY "wedding_events_update_policy"
  FOR UPDATE
  USING (...) WITH CHECK (...);  -- ✅ Both clauses

CREATE POLICY "wedding_events_delete_policy"
  FOR DELETE
  USING (...);  -- ✅ USING for DELETE
```

## How to Verify It Works

After running the migration:

1. **Refresh your EventKaro app**
2. **Go to Events & Timeline tab**
3. **Click "Create Wedding Timeline"**
4. **Select "Wedding" event** (it's pre-checked)
5. **Click "Create Wedding Timeline" button**
6. **Should redirect to timeline view** with your events created! ✅

## Still Getting Errors?

If you still see permission errors after applying the migration, check:

### 1. User Has Organization Membership

Run this query in Supabase SQL Editor:
```sql
SELECT
  u.email,
  om.organization_id,
  om.role,
  o.name as org_name
FROM auth.users u
LEFT JOIN organization_members om ON u.id = om.user_id
LEFT JOIN organizations o ON om.organization_id = o.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email
```

**Expected Result:** Should show your organization membership

**If empty:** Your user doesn't have an organization. Create one:
```sql
-- 1. Create organization
INSERT INTO organizations (name, owner_id)
VALUES ('My Wedding', auth.uid())
RETURNING id;

-- 2. Note the returned ID, then add membership
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (
  'your-org-id-from-step-1',  -- Replace with ID from step 1
  auth.uid(),
  'owner'
);
```

### 2. Events Belong to Your Organization

```sql
SELECT
  e.id,
  e.title,
  e.organization_id,
  o.name as org_name
FROM events e
JOIN organizations o ON e.organization_id = o.id
WHERE e.event_type = 'wedding'
ORDER BY e.created_at DESC;
```

**Expected:** Your wedding event should be linked to your organization

### 3. RLS is Enabled

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'wedding_events';
```

**Expected:** `rowsecurity` should be `true`

## Technical Details

### Why FOR ALL + USING Doesn't Work for INSERT

PostgreSQL RLS policies have two clauses:
- **USING**: Checks existing rows (SELECT, UPDATE, DELETE)
- **WITH CHECK**: Validates new/modified rows (INSERT, UPDATE)

When you use `FOR ALL`, PostgreSQL does NOT automatically use `USING` for `WITH CHECK`. This is a PostgreSQL design decision to prevent accidental security holes.

For `INSERT` operations specifically:
- The row doesn't exist yet
- There's nothing to check with `USING`
- `WITH CHECK` validates the row BEFORE insertion
- Without `WITH CHECK`, PostgreSQL denies the INSERT

### Migration Safety

The migration:
- ✅ Drops old policies cleanly with `IF EXISTS`
- ✅ No data loss - only changes permissions
- ✅ No downtime - policies are replaced atomically
- ✅ Backwards compatible - same permission logic
- ✅ Can be rolled back if needed

### Rollback (If Needed)

If you need to rollback to the old policy:
```sql
-- Drop new policies
DROP POLICY IF EXISTS "wedding_events_insert_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_select_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_update_policy" ON wedding_events;
DROP POLICY IF EXISTS "wedding_events_delete_policy" ON wedding_events;

-- Restore old policy
CREATE POLICY "Org members can manage wedding events"
  ON wedding_events FOR ALL
  TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );
```

## Need Help?

If the error persists after trying these fixes:
1. Check the browser console for detailed errors
2. Check Supabase logs: Dashboard → Logs → Database
3. Verify your user's auth.uid() matches organization_members.user_id
4. Ensure the parent event exists and belongs to your organization

The RLS policies are now production-ready and follow PostgreSQL best practices! 🎉
