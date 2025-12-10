# 🎉 EventKaro - Complete Event Management Platform

A modern, full-stack event management platform built for the Indian market, featuring comprehensive guest management and a complete vendor marketplace.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## ✨ Features

### 🎊 Event Management
- **Complete Event Planning** - Create and manage events with all details
- **Timeline Management** - Track event schedules and milestones
- **Venue Management** - Store venue information and locations
- **Budget Tracking** - Monitor event expenses and budgets

### 👥 Guest Management
- **Guest Profiles** - Comprehensive guest information
- **RSVP Tracking** - Real-time RSVP status updates
- **Dietary Preferences** - Track special dietary requirements (Vegan, Jain, etc.)
- **Plus One Management** - Handle guest companions
- **Check-in System** - Track event attendance
- **Guest Groups** - Organize guests by families, friends, colleagues
- **CSV Import/Export** - Bulk guest management

### 🏨 Accommodation Management
- **Hotel Blocks** - Reserve accommodation for guests
- **Room Assignments** - Assign guests to specific rooms
- **Utilization Tracking** - Monitor room booking status

### 🛍️ Vendor Marketplace
- **15 Vendor Categories** - Caterer, Photographer, Decorator, Venue, and more
- **Vendor Profiles** - Complete business information
- **Service Management** - Add individual services with pricing
- **Package Management** - Create bundled service packages
- **Quote System** - Request and respond to quotes
- **Reviews & Ratings** - Build vendor reputation
- **Advanced Filtering** - By type, city, price range
- **Favorites** - Save preferred vendors
- **Multi-Channel Contact** - Phone, WhatsApp, Email

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/EventKaro.git
cd EventKaro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Run database migrations:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Run all migration files from `/supabase/migrations` in order

6. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
EventKaro/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── events/         # Event management
│   │   │   ├── vendors/        # Vendor marketplace
│   │   │   └── vendor/         # Vendor dashboard
│   │   ├── auth/               # Authentication
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── features/           # Feature-specific components
│   ├── actions/                # Server actions
│   │   ├── events.ts           # Event operations
│   │   ├── guests.ts           # Guest operations
│   │   ├── accommodations.ts  # Accommodation operations
│   │   └── vendors.ts          # Vendor operations
│   └── lib/                    # Utilities
│       └── supabase/           # Supabase client
└── supabase/
    └── migrations/             # Database migrations
```

## 🗄️ Database Schema

### Core Tables:
- **users** - User accounts (Supabase Auth)
- **profiles** - User profiles
- **organizations** - Event planning organizations
- **events** - Event information

### Guest Management:
- **guests** - Guest profiles
- **guest_groups** - Guest categorization
- **guest_dietary_preferences** - Dietary requirements
- **accommodations** - Hotel blocks
- **accommodation_assignments** - Room assignments

### Vendor Marketplace:
- **vendors** - Vendor profiles
- **vendor_services** - Individual services
- **vendor_packages** - Service bundles
- **quote_requests** - Quote workflow
- **vendor_reviews** - Reviews & ratings
- **vendor_favorites** - Saved vendors
- **vendor_bookings** - Confirmed bookings

## 🎯 Key Features by User Type

### For Event Organizers:
✅ Create and manage multiple events
✅ Invite and track guests
✅ Import/export guest lists
✅ Manage RSVPs and dietary preferences
✅ Arrange accommodation for guests
✅ Discover and contact vendors
✅ Request quotes from multiple vendors
✅ Save favorite vendors
✅ Read vendor reviews

### For Vendors:
✅ Create business profile
✅ Add services with pricing
✅ Create package deals
✅ Receive quote requests
✅ Respond with proposals
✅ Manage quotes dashboard
✅ Track business statistics
✅ Edit profile information

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

[Detailed deployment guide](./DEPLOYMENT.md)

### Environment Variables for Production:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## 📊 Statistics

- **24 Server Actions** - Backend operations
- **16 UI Components** - Reusable components
- **13 Pages** - Complete user flows
- **~8,000 lines** - Production-ready code
- **7 Database Tables** - Vendor marketplace
- **15 Vendor Categories** - Comprehensive coverage

## 🔒 Security

- Row-Level Security (RLS) on all tables
- User authentication required for actions
- Vendor ownership verification
- Input validation on all forms
- Secure contact information handling

## 📈 Roadmap

### Phase 1 ✅ (Complete)
- Event management
- Guest management
- Vendor marketplace
- Quote system

### Phase 2 🚧 (Planned)
- Email notifications
- Image uploads
- Payment integration
- Booking system
- Review submission

### Phase 3 🔮 (Future)
- In-app messaging
- Mobile app (PWA)
- AI recommendations
- Multi-language support
- Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Bhavesh** - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn for the beautiful UI components
- Vercel for hosting and deployment

## 📞 Support

For support, email support@eventkaro.com or open an issue on GitHub.

---

**Built with ❤️ for the Indian event planning community**
