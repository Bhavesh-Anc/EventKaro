import { getUser } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Search, Filter, Download } from 'lucide-react';

export default async function GuestsPage() {
  const user = await getUser();
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];
  const supabase = await createClient();

  // Fetch all guests for this organization
  const { data: guests, count } = await supabase
    .from('guests')
    .select('*', { count: 'exact' })
    .eq('organization_id', currentOrg.id)
    .order('created_at', { ascending: false });

  const confirmedGuests = guests?.filter((g) => g.rsvp_status === 'confirmed').length || 0;
  const pendingGuests = guests?.filter((g) => g.rsvp_status === 'pending').length || 0;
  const declinedGuests = guests?.filter((g) => g.rsvp_status === 'declined').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600 mt-1">Manage all your wedding guests</p>
        </div>
        <Link
          href="/events"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950 flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
          Add Guest
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Guests</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{count || 0}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Confirmed</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{confirmedGuests}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingGuests}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Declined</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{declinedGuests}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Guest List */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Guests</h3>

          {!guests || guests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests yet</h3>
              <p className="text-gray-600 mb-6">Add guests to your events to see them here</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950"
              >
                <UserPlus className="h-5 w-5" />
                Go to Events
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Side</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{guest.name}</td>
                      <td className="py-3 px-4 text-gray-600">{guest.email || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{guest.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            guest.rsvp_status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : guest.rsvp_status === 'declined'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {guest.rsvp_status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {guest.family_side ? (
                          <span className="capitalize">{guest.family_side}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
