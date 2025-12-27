import { notFound } from 'next/navigation';
import { getGuestByInvitationToken } from '@/actions/planning';
import PublicGuestRSVPForm from '@/components/features/public-guest-rsvp-form';

export default async function RSVPPage({ params }: { params: { token: string } }) {
  const { token } = await params;
  const guest = await getGuestByInvitationToken(token);

  if (!guest) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're Invited!
          </h1>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">
              {guest.event.title}
            </h2>
            <div className="text-gray-600 space-y-2">
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(guest.event.start_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {(guest.event.venue_name || guest.event.venue_city) && (
                <p className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[guest.event.venue_name, guest.event.venue_city].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          <p className="text-gray-600">
            Please fill in your details below to RSVP and help us plan better for your arrival.
          </p>
        </div>

        {/* RSVP Form */}
        <PublicGuestRSVPForm guest={guest} invitationToken={token} />

        {/* Footer */}
        <div className="max-w-3xl mx-auto mt-12 text-center text-sm text-gray-500">
          <p>
            Need help? Contact the event organizer for assistance.
          </p>
          <p className="mt-2">
            Powered by EventKaro
          </p>
        </div>
      </div>
    </div>
  );
}
