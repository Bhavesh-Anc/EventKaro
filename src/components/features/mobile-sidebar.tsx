'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { X, Home, Users, Calendar, IndianRupee, Store, ListTodo, Settings, Heart } from 'lucide-react';

interface WeddingInfo {
  id: string;
  title: string;
  date: string;
  venueName: string | null;
  venueCity: string | null;
  daysRemaining: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wedding: WeddingInfo | null;
}

interface NavSubItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Guest Management', href: '/guests', icon: Users },
  { name: 'Events & Timeline', href: '/timeline', icon: Calendar },
  { name: 'Budget Tracker', href: '/budget', icon: IndianRupee },
  { name: 'Vendors', href: '/vendors', icon: Store, subItems: [
    { name: 'Saved Vendors', href: '/vendors/saved', icon: Heart },
  ] },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileSidebar({ isOpen, onClose, wedding }: Props) {
  const pathname = usePathname();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = wedding?.date
    ? format(new Date(wedding.date), 'd MMM yyyy')
    : 'Not set';

  const getDaysText = () => {
    if (!wedding) return '';
    if (wedding.daysRemaining === 0) return "It's today!";
    if (wedding.daysRemaining === 1) return '1 day remaining';
    return `${wedding.daysRemaining} days remaining`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-700 to-rose-900">
              <span className="text-white text-xl">✦</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EventKaro</h1>
              <p className="text-xs text-gray-500">Wedding Command Center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors
                    ${isActive
                      ? 'bg-gradient-to-r from-rose-700 to-rose-900 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
                {/* Sub-items */}
                {item.subItems && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`
                            flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors
                            ${isSubActive
                              ? 'bg-rose-100 text-rose-800 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          <SubIcon className="h-4 w-4" />
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Wedding Date Card */}
        {wedding ? (
          <div className="m-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs font-medium text-amber-900 mb-1">Wedding Date</p>
            <p className="text-lg font-bold text-amber-900">{formattedDate}</p>
            <p className="text-xs text-amber-700 mt-1">{getDaysText()}</p>
            {wedding.venueCity && (
              <p className="text-xs text-amber-600 mt-1">📍 {wedding.venueCity}</p>
            )}
          </div>
        ) : (
          <div className="m-3 rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-600 mb-1">Wedding Date</p>
            <p className="text-sm text-gray-500 italic">No wedding created yet</p>
            <Link
              href="/events/new"
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold mt-2 inline-block"
            >
              Create Wedding →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
