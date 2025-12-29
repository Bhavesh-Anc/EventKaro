# Database Migrations

## Applying Migrations to Production

The project uses Supabase migrations to manage database schema changes. To deploy to production:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Migrations**
3. Upload and run the migration files from `supabase/migrations/` in chronological order

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

## Recent Migrations (Wedding-Focused)

### 20241230040000_vendor_contracts_deliverables.sql **[NEW - CRITICAL]**
**Vendor accountability system** - The secret sauce marketplace
- Vendor contracts with scope of work, payment milestones, cancellation terms
- Deliverables checklist (photo shoots, decoration items, catering menus)
- Payment milestone tracking with overdue detection
- **Vendor performance logs** (private, data-driven)
- **Vendor reliability scores** (calculated view based on real data)
  - On-time arrival tracking
  - Scope adherence scoring
  - Quality delivery ratings
  - Cancellation/dispute frequency
- Contract completion dashboard

### 20241230030000_wedding_guest_hierarchy.sql **[NEW - CRITICAL]**
**Indian wedding guest management** - Relationship-aware system
- Family-aware guest hierarchy (Bride/Groom side, VIP/Close/General priority)
- Demographics tracking (elderly, children, special care needs)
- Outstation vs Local classification
- **Hotel inventory & room allocation system**
  - Hotel room blocking
  - Room assignments with sharing preferences
  - Utilization tracking
- **Transportation schedule & assignments**
  - Bus/car allocations per event
  - Pickup/dropoff from airports/stations
  - Capacity management
- Family groups with WhatsApp integration
- Seating arrangement support

### 20241230020000_wedding_multi_event_system.sql **[NEW - CRITICAL]**
**Multi-event wedding timeline** - The core differentiator
- One wedding → Many sub-events (Engagement, Mehendi, Haldi, Sangeet, Wedding, Reception)
- Each sub-event has:
  - Independent venue and timing
  - Guest subset assignments
  - Vendor assignments with deliverables
  - Budget allocation
  - Dress code and theme colors
  - Transportation logistics
- **Automatic conflict detection**
  - Overlapping event times
  - Same vendor at multiple events
- Helper function to create default wedding events
- Drag-and-drop timeline ready (sequence_order field)

### 20241230010000_add_missing_guest_columns.sql
Adds missing columns to the `guests` table for RSVP functionality:
- Special requirements (dietary, accessibility, special requests)
- Number of guests and guest names
- Arrival/departure travel details
- Accommodation preferences

### 20241230000000_fix_rsvp_rls.sql
Fixes Row Level Security policies to allow anonymous RSVP submissions via invitation tokens.

## Migration Dependencies

Apply in this order:
1. All base migrations (already applied)
2. `20241230000000_fix_rsvp_rls.sql`
3. `20241230010000_add_missing_guest_columns.sql`
4. `20241230020000_wedding_multi_event_system.sql` ← **Required for wedding features**
5. `20241230030000_wedding_guest_hierarchy.sql` ← **Extends guests table**
6. `20241230040000_vendor_contracts_deliverables.sql` ← **Vendor accountability**

## Verification

### RSVP System
1. Create a guest and generate invitation link
2. Open invitation link in incognito/private window
3. Fill out and submit RSVP form
4. Verify submission succeeds without errors

### Wedding Multi-Event System
1. Create an event with type = 'wedding'
2. Call `SELECT create_default_wedding_events(event_id, 'wedding_date')` to generate sub-events
3. Verify 6 sub-events created (Engagement → Reception)
4. Check conflict detection views work

### Guest & Hotel Management
1. Create guests with family_side = 'bride' or 'groom'
2. Mark some as is_outstation = TRUE, hotel_required = TRUE
3. Create hotel inventory
4. Assign rooms to guests
5. Check hotel_utilization view

### Vendor Contracts
1. Create a vendor contract
2. Add deliverables checklist
3. Add payment milestones
4. Check contract_completion_summary view
5. Log vendor performance
6. Check vendor_reliability_scores view
