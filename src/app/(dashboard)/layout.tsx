import { redirect } from 'next/navigation';
import { getUser } from '@/actions/auth';
import { getCurrentWedding } from '@/actions/events';
import { WeddingSidebar } from '@/components/features/wedding-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Get current wedding info for the sidebar
  const wedding = await getCurrentWedding();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <WeddingSidebar wedding={wedding} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
