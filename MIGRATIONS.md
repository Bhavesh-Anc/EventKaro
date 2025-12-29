# Database Migrations

## Applying Migrations to Production

The project uses Supabase migrations to manage database schema changes. To deploy to production:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Migrations**
3. Upload and run the migration files from `supabase/migrations/` in order

### Option 2: Using Supabase CLI

```bash
# Link to your Supabase project (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations to production
npx supabase db push
```

### Option 3: Manual SQL Execution

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the migration SQL files in chronological order
3. Execute each migration

## Recent Migrations

### 20241230010000_add_missing_guest_columns.sql
Adds missing columns to the `guests` table for RSVP functionality:
- Special requirements (dietary, accessibility, special requests)
- Number of guests and guest names
- Arrival/departure travel details
- Accommodation preferences

### 20241230000000_fix_rsvp_rls.sql
Fixes Row Level Security policies to allow anonymous RSVP submissions via invitation tokens.

## Verification

After applying migrations, test RSVP submission:
1. Create a guest and generate invitation link
2. Open invitation link in incognito/private window
3. Fill out and submit RSVP form
4. Verify submission succeeds without errors
