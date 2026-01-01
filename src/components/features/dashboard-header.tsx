'use client';

import { useState } from 'react';
import { Menu, X, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { NotificationCenter, type Notification } from './notification-center';
import { signOut } from '@/actions/auth';

interface Props {
  userName: string;
  notifications: Notification[];
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function DashboardHeader({
  userName,
  notifications,
  onMenuToggle,
  showMenuButton = false
}: Props) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationList, setNotificationList] = useState(notifications);

  const handleMarkAsRead = (id: string) => {
    setNotificationList(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotificationList(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDismiss = (id: string) => {
    setNotificationList(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 md:px-6">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        )}

        {/* Search bar (hidden on mobile) */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests, vendors, tasks..."
            className="w-80 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side - Notifications and User menu */}
      <div className="flex items-center gap-2">
        {/* Mobile search button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          <Search className="h-5 w-5 text-gray-600" />
        </button>

        {/* Notifications */}
        <NotificationCenter
          notifications={notificationList}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllRead={handleMarkAllRead}
          onDismiss={handleDismiss}
        />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {userName.split(' ')[0]}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Wedding Planner</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
