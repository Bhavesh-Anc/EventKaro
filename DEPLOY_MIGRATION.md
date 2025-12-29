# Deploy RSVP RLS Migration

## Critical: RSVP Submission Fix

The RSVP submission failure is caused by missing Row Level Security (RLS) policies that allow anonymous users to update guest records via invitation tokens.

## Migration Status

Migration file: `supabase/migrations/20241230000000_fix_rsvp_rls.sql`

This migration:
- Fixes RLS policies to allow anonymous RSVP submissions via invitation tokens
- Allows both anonymous (anon) and authenticated users to update/view guest records
- Uses time-limited invitation tokens for security

## How to Apply Migration

### Option 1: Using Supabase CLI (Recommended)

```bash
# If not already linked, link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations to production
npx supabase db push
```

### Option 2: Manual SQL Execution

If you can't use the CLI, run this SQL directly in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20241230000000_fix_rsvp_rls.sql`
3. Paste and execute

### Option 3: Via Supabase Dashboard

1. Go to Database → Migrations in Supabase Dashboard
2. Upload the migration file: `supabase/migrations/20241230000000_fix_rsvp_rls.sql`
3. Apply the migration

## Verify Migration

After applying, test by:
1. Opening an RSVP invitation link
2. Filling out the RSVP form
3. Submitting - should succeed without errors

## What This Fixes

- ✅ Anonymous users can now submit RSVPs via invitation links
- ✅ Invitation tokens are validated (must be non-null and not expired)
- ✅ Authenticated event organizers can still manage all guests
- ✅ Proper RLS policies prevent unauthorized access

## Additional Changes in This Update

1. **Vendor Marketplace UX**: Moved "Are you a vendor?" CTA to a more prominent position (after stats, before filters)
2. **Better Error Handling**: RSVP form now shows detailed error messages from the server
3. **Enhanced Logging**: Added detailed console logging for debugging RSVP issues
