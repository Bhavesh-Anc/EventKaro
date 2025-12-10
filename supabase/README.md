# Supabase Database Setup

This directory contains the database migrations for EventKaro.

## Applying Migrations to Cloud Supabase

Since you're using Cloud Supabase, you can apply these migrations using the Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20241209000000_initial_schema.sql`
4. Paste into the SQL Editor and run

Alternatively, you can use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your cloud project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Schema Overview

The database includes:

- **organizations**: Multi-tenant organization management
- **organization_members**: User roles within organizations
- **events**: Core event information
- **ticket_types**: Different ticket categories per event
- **promo_codes**: Discount codes
- **orders**: Purchase orders
- **order_items**: Line items in orders
- **tickets**: Individual tickets for attendees
- **payments**: Payment transaction records
- **check_ins**: Attendance tracking
- **profiles**: Extended user profile data

## Row Level Security

All tables have RLS enabled with policies for:
- Public access to published events
- Organization members managing their events
- Users accessing their own data (orders, tickets, profiles)

## Functions and Triggers

- Automatic `updated_at` timestamp updates
- Full-text search vector updates for events
- Automatic profile creation on user signup
