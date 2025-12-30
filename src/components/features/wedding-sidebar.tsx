'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  IndianRupee,
  Store,
  ListTodo,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Guest Management', href: '/guests', icon: Users },
  { name: 'Events & Timeline', href: '/timeline', icon: Calendar },
  { name: 'Budget Tracker', href: '/budget', icon: IndianRupee },
  { name: 'Vendors', href: '/vendors', icon: Store },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Pages where the wedding sidebar should NOT appear
const hiddenOnRoutes = [
  '/events/new',
  '/events/new/wedding',
  '/events/new/other',
  '/organizations/new',
];

export function WeddingSidebar() {
  const pathname = usePathname();

  // Don't show sidebar on certain pages (like create event flow)
  const shouldHide = hiddenOnRoutes.some(route => pathname?.startsWith(route));
  if (shouldHide) {
    return null;
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-700 to-rose-900">
          <span className="text-white text-xl">✦</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">EventKaro</h1>
          <p className="text-xs text-gray-500">Wedding Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-gradient-to-r from-rose-700 to-rose-900 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Wedding Date Card */}
      <div className="m-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="text-xs font-medium text-amber-900 mb-1">Wedding Date</p>
        <p className="text-lg font-bold text-amber-900">18 Feb 2025</p>
        <p className="text-xs text-amber-700 mt-1">45 days remaining</p>
      </div>
    </div>
  );
}
