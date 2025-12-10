import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  // If user has no organization, redirect to create one
  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  // For now, use the first organization
  const currentOrg = organizations[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current Organization</p>
          <p className="font-semibold">{currentOrg.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Tickets Sold</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">₹0</p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <Link
            href="/events/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Event
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/events/new"
            className="rounded-md border p-4 text-left hover:bg-muted block"
          >
            <h4 className="font-medium">Create Event</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up a new event in minutes
            </p>
          </Link>
          <Link
            href="/events"
            className="rounded-md border p-4 text-left hover:bg-muted block"
          >
            <h4 className="font-medium">View Events</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage all your events
            </p>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border p-4 text-left hover:bg-muted block"
          >
            <h4 className="font-medium">Analytics</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              View detailed event analytics
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
