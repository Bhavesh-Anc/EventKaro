# EventKaro

**EventKaro** - Complete Event Management Platform for India

## Overview

EventKaro is a comprehensive SaaS platform that simplifies event planning and management. From weddings to corporate events, EventKaro provides all the tools needed to organize successful events, manage guests, coordinate vendors, and track budgets - all from one dashboard.

## Key Features

### For Event Organizers
- **Multi-Event Management** - Manage multiple events from a single organization dashboard
- **Smart Guest Management** - Track RSVPs, dietary needs, seating, travel details with easy CSV import
- **Vendor Marketplace** - Browse 15+ vendor categories, request quotes, and book services
- **Budget Tracking** - Monitor expenses, payments, and stay within budget
- **Travel Coordination** - Track guest arrivals/departures, coordinate pickups
- **Accommodation Planning** - Manage hotel bookings and room assignments
- **Email Invitations** - Send personalized RSVP links via email

### For Vendors
- **Professional Marketplace** - Showcase services to thousands of event organizers
- **Quote Management** - Receive and respond to quote requests
- **Booking System** - Manage bookings and payment schedules
- **Business Dashboard** - Track inquiries, bookings, and revenue

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
