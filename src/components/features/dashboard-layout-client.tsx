'use client';

import { useState } from 'react';
import { WeddingSidebar } from './wedding-sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { DashboardHeader } from './dashboard-header';
import { type Notification } from './notification-center';

interface WeddingInfo {
  id: string;
  title: string;
  date: string;
  venueName: string | null;
  venueCity: string | null;
  daysRemaining: number;
}

interface Props {
  children: React.ReactNode;
  wedding: WeddingInfo | null;
  userName: string;
  notifications: Notification[];
}

export function DashboardLayoutClient({ children, wedding, userName, notifications }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <WeddingSidebar wedding={wedding} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        wedding={wedding}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with notifications */}
        <DashboardHeader
          userName={userName}
          notifications={notifications}
          onMenuToggle={() => setMobileMenuOpen(true)}
          showMenuButton={true}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
