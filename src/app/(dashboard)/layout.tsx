import { redirect } from 'next/navigation';
import { getUser } from '@/actions/auth';
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <WeddingSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
