# EventKaro - Quick Reference

## 🚀 Common Commands

### Development
```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Supabase (if using CLI)
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-ref

# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Push migrations
supabase db push

# Pull types
supabase gen types typescript --local > src/types/supabase.ts
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (not in git) |
| `.env.example` | Template for environment variables |
| `src/middleware.ts` | Auth token refresh |
| `src/lib/supabase/client.ts` | Client-side Supabase |
| `src/lib/supabase/server.ts` | Server-side Supabase |
| `src/actions/auth.ts` | Server actions for auth |
| `supabase/migrations/` | Database migrations |
| `components.json` | shadcn/ui config |

## 🔐 Environment Variables

Required for basic functionality:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 📂 Project Structure at a Glance

```
src/
├── app/
│   ├── (auth)/          # Login, Signup
│   ├── (dashboard)/     # Protected pages
│   ├── api/             # API routes
│   └── page.tsx         # Home
├── components/
│   ├── ui/              # Base components
│   └── features/        # Feature components
├── lib/
│   ├── supabase/        # DB clients
│   └── utils.ts         # Helpers
├── actions/             # Server actions
└── types/               # TypeScript types
```

## 🎨 Adding shadcn/ui Components

```bash
# Add a component (future - requires npx shadcn-ui CLI)
# For now, manually create components in src/components/ui/

# Example components to add:
# - Dialog
# - Dropdown Menu
# - Form
# - Input
# - Label
# - Select
# - Toast
```

## 🗄️ Database Quick Reference

### Main Tables
- `organizations` - Companies/teams
- `events` - Event info
- `ticket_types` - Ticket categories
- `orders` - Purchases
- `tickets` - Individual tickets
- `payments` - Payment records

### Key Relationships
```
organizations
  ↓ has many
events
  ↓ has many
ticket_types
  ↓ used in
orders
  ↓ generates
tickets
```

## 🔒 RLS Patterns

```sql
-- Users see their own data
USING (user_id = auth.uid())

-- Org members see org data
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
)

-- Public data
USING (status = 'published')
```

## 📝 Code Snippets

### Server Component with Auth
```typescript
import { getUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getUser();
  if (!user) redirect('/login');

  return <div>Hello {user.email}</div>;
}
```

### Client Component with Supabase
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Component() {
  const supabase = createClient();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('events').select('*');
      setData(data);
    }
    loadData();
  }, []);

  return <div>{/* render data */}</div>;
}
```

### Server Action
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .insert({ title: formData.get('title') })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { data };
}
```

## 🐛 Debugging Tips

### Check Auth State
```typescript
// In Server Component
const user = await getUser();
console.log('User:', user);

// In Client Component
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Check Database Connection
```typescript
const { data, error } = await supabase.from('events').select('count');
console.log('DB Check:', { data, error });
```

### Check Environment Variables
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

## 🌐 Common URLs (Local Dev)

- App: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard
- API Routes: http://localhost:3000/api/*

## 📊 Performance Tips

1. Use Server Components by default
2. Only use 'use client' when needed (interactivity, hooks)
3. Fetch data in Server Components (better for SEO)
4. Use Next.js Image component for images
5. Enable RLS on all tables
6. Add indexes for frequently queried columns

## 🚨 Security Checklist

- [ ] Never commit `.env.local`
- [ ] Use service role key only in server-side code
- [ ] Enable RLS on all tables
- [ ] Validate all user inputs
- [ ] Use Zod for form validation
- [ ] Sanitize user-generated content
- [ ] Rate limit API routes
- [ ] Use HTTPS in production

## 📚 Helpful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Razorpay Docs](https://razorpay.com/docs)

---

Keep this file handy for quick lookups! 🎯
