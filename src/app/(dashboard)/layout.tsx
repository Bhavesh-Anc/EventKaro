import { redirect } from 'next/navigation';
import { getUser } from '@/actions/auth';
import { getCurrentWedding } from '@/actions/events';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayoutClient } from '@/components/features/dashboard-layout-client';
import { generateNotifications, type Notification } from '@/components/features/notification-center';

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
  const supabase = await createClient();

  // Fetch data needed for notifications
  let notifications: Notification[] = [];

  if (wedding) {
    // Get pending RSVP count
    const { count: pendingRSVPs } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('rsvp_status', 'pending');

    // Get overdue/pending vendor payments
    const { data: pendingPayments } = await supabase
      .from('wedding_event_budgets')
      .select('vendor_id, pending_amount_inr, vendors:vendor_profiles(business_name)')
      .gt('pending_amount_inr', 0)
      .limit(5);

    // Get upcoming tasks
    const { data: upcomingTasks } = await supabase
      .from('tasks')
      .select('title, due_date')
      .eq('completed', false)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5);

    // Get guests needing logistics
    const { count: needingHotel } = await supabase
      .from('wedding_family_groups')
      .select('*', { count: 'exact', head: true })
      .eq('is_outstation', true)
      .lt('rooms_allocated', 1);

    const { count: needingPickup } = await supabase
      .from('wedding_family_groups')
      .select('*', { count: 'exact', head: true })
      .eq('pickup_required', true)
      .eq('pickup_assigned', false);

    const daysToWedding = wedding.daysRemaining;

    notifications = generateNotifications({
      pendingRSVPs: pendingRSVPs || 0,
      newRSVPsToday: 0, // Would need timestamp tracking
      overduePayments: (pendingPayments || []).map((p: any) => ({
        vendor: p.vendors?.business_name || 'Vendor',
        amount: p.pending_amount_inr || 0,
      })),
      upcomingTasks: (upcomingTasks || []).map((t: any) => ({
        title: t.title,
        dueDate: new Date(t.due_date),
      })),
      daysToWedding,
      guestsNeedingHotel: needingHotel || 0,
      guestsNeedingPickup: needingPickup || 0,
    });
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <DashboardLayoutClient
      wedding={wedding}
      userName={userName}
      notifications={notifications}
    >
      {children}
    </DashboardLayoutClient>
  );
}
