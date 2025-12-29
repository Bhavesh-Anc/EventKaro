# EventKaro

**EventKaro** - India's First Wedding-Obsessed Event Management Platform

## Overview

EventKaro isn't just another event management tool. We're **laser-focused on Indian weddings** — the most complex, multi-day, family-intensive events on the planet. While others do "events," we do weddings properly.

### Why Wedding-First?

Indian weddings aren't events. They're:
- **6 sub-events minimum** (Engagement → Mehendi → Haldi → Sangeet → Wedding → Reception)
- **300-1000 guests** with complex family hierarchies
- **Outstation logistics** (hotels, pickups, buses)
- **Vendor chaos** (tracking 10-15 vendors across multiple days)
- **Budget bleeding** without proper tracking

EventKaro is built for this reality.

## What Makes Us Different

### 1. Multi-Event Wedding Timeline (Non-Negotiable)
**One wedding → Six sub-events, each with:**
- Separate venue, timing, dress code
- Guest subset assignments
- Vendor deliverables mapped to specific events
- Budget allocation
- **Automatic conflict detection** (overlapping times, vendor double-booking)

**Drag-and-drop timeline** with instant conflict alerts.

### 2. Family-Aware Guest Hierarchy
We don't track "guests." We track **relationships**:
- Bride side / Groom side
- VIP / Close Family / Extended Family / Friends
- Outstation vs Local
- Elderly / Kids with special care needs
- Hotel required? Pickup required?

**This alone collapses 6 Excel sheets into one system.**

### 3. Guest Logistics Engine
Silent nightmare solver:
- Hotel inventory & room allocation (with overbooking detection)
- Transport schedule (bus/car assignments per flight/train arrival)
- Queries like: *"Show all guests landing before 10 AM Friday"*
- Automatic pickup/dropoff scheduling

### 4. Vendor Obsession
We don't just help you find vendors. We help you **survive working with them**.

#### Vendor Contracts & Deliverables
Every vendor gets:
- Scope of work mapped to specific sub-events
- Deliverables checklist (candid shots, drone footage, decoration items)
- Payment milestones with auto-tracking
- Cancellation terms

**Example:** Photographer delivers traditional shots at wedding, candid at mehendi, drone at reception.

#### Vendor Reliability Score (Private, Powerful)
Not Google reviews. Real data:
- On-time arrival tracking
- Scope adherence scoring
- Quality delivery ratings
- Cancellation/dispute frequency

**This becomes your secret sauce marketplace.**

### 5. Wedding Budget with Reality Baked In
Budget layers:
- Planned vs Committed vs Paid vs Pending
- Variance tracking per sub-event
- Alerts: *"You're 12% over budget due to last-minute guest adds"*

Families don't want finance software. They want **reassurance**.

## For Event Organizers

### Wedding Planning Features
✅ **Multi-event timeline** with conflict detection
✅ **Family-side guest management** (Bride/Groom)
✅ **Hotel room inventory** and allocation
✅ **Transportation scheduling** (airport/station pickups)
✅ **Vendor contract tracking** with deliverables
✅ **Budget variance analysis** per sub-event
✅ **RSVP system** (WhatsApp-friendly, family-based)
✅ **Seating arrangements** by relationship

### Vendor Marketplace
✅ Browse 15+ vendor categories
✅ View **private reliability scores** (data-driven)
✅ Request quotes & book services
✅ Track contract fulfillment

## For Vendors

### Separate Vendor Portal
- **Professional marketplace** visibility
- Quote & booking management
- Payment milestone tracking
- Performance dashboard
- Multi-event assignment support

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Services**: Resend (emails), Vercel (hosting)

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/EventKaro.git
cd EventKaro

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Supabase and Resend keys

# Run migrations
npx supabase db push

# Start development server
npm run dev
```

Visit http://localhost:3000

## Project Structure

- `/src/app` - Next.js pages (auth, dashboard, public RSVP)
- `/src/actions` - Server actions (events, guests, vendors, budgets)
- `/src/components` - React components (features + UI)
- `/supabase/migrations` - Database migrations

## Database

PostgreSQL with Row Level Security (RLS):
- Organizations & multi-tenant access control
- Events, guests, guest groups
- Vendors, services, packages, bookings
- Quote requests/responses, reviews
- Budget items, accommodations

## Security

- Anonymous RSVP via time-limited invitation tokens
- Row Level Security for data isolation
- Supabase Auth with email verification  
- Full TypeScript type safety

## License

MIT License

## Made with ❤️ in India
