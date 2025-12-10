# Quick Setup Guide

Follow these steps to get EventKaro running locally.

## Step 1: Install Dependencies

The dependencies should already be installed. If not, run:

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Name: EventKaro
   - Database Password: (choose a strong password)
   - Region: Singapore or Mumbai (closest to India)
5. Wait for the project to be created (~2 minutes)

### Get Your API Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create `.env.local` file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

## Step 4: Set Up Database Schema

### Using Supabase SQL Editor (Easiest)

1. In Supabase dashboard, click "SQL Editor" in the sidebar
2. Click "New Query"
3. Open `supabase/migrations/20241209000000_initial_schema.sql` in your code editor
4. Copy all the contents
5. Paste into the SQL Editor
6. Click "Run" or press Ctrl+Enter
7. You should see "Success. No rows returned"

This creates all the tables, indexes, RLS policies, and triggers.

### Using Supabase CLI (Alternative)

If you prefer using the CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 5: Configure Authentication

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add Site URL: `http://localhost:3000`
3. Add these Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

4. Go to Authentication > Providers
5. Make sure **Email** is enabled (it should be by default)

## Step 6: Start Development Server

```bash
npm run dev
```

The app will open at http://localhost:3000

## Step 7: Create Your First Account

1. Navigate to http://localhost:3000/signup
2. Fill in:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
3. Click "Sign up"
4. Check your email for confirmation link
5. Click the confirmation link
6. You'll be redirected to the dashboard!

## Verify Everything Works

### Check Database Tables

In Supabase dashboard:
1. Go to "Table Editor"
2. You should see these tables:
   - organizations
   - organization_members
   - events
   - ticket_types
   - orders
   - tickets
   - payments
   - check_ins
   - profiles
   - promo_codes

### Check Your Profile

1. Log in to your account
2. You should see the dashboard at `/dashboard`
3. In Supabase Table Editor, check the `profiles` table
4. You should see your profile with your name

## Common Issues

### ❌ "Failed to fetch" or network errors
**Solution**: Check that your `.env.local` has the correct Supabase URL and keys

### ❌ Database errors or "relation does not exist"
**Solution**: Make sure you ran the migration SQL in Step 4

### ❌ Can't sign up or "Invalid email"
**Solution**:
1. Check Supabase Auth settings
2. Make sure email provider is enabled
3. Check that Site URL and Redirect URLs are set

### ❌ "Server Error" after signup
**Solution**:
1. Check that the `profiles` table exists
2. Check that the `handle_new_user()` trigger is created
3. Look at Supabase logs for detailed errors

### ❌ Stuck on "Loading" or redirects not working
**Solution**:
1. Clear browser cache
2. Try incognito mode
3. Check browser console for errors

## Next Steps

Once everything is working:

1. **Create an Organization**: You'll need this to create events
2. **Create Your First Event**: Try creating a test conference or workshop
3. **Set Up Ticket Types**: Add different ticket tiers
4. **Explore the Dashboard**: Check out the analytics and stats

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs

## Optional: Set Up Razorpay (for payments later)

When you're ready to implement payments:

1. Sign up at https://razorpay.com
2. Get your Test API keys from Dashboard > Settings > API Keys
3. Add to `.env.local`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

You're all set! Happy coding! 🚀
