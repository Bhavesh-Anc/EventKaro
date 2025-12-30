'use client';

import { Star, Hotel, Truck, CheckCircle2, XCircle, Clock, HelpCircle } from 'lucide-react';

export interface IndividualGuest {
  id: string;
  name: string;
  family_name: string;
  family_side: 'bride' | 'groom';
  rsvp_status: 'pending' | 'confirmed' | 'declined' | 'maybe';
  is_outstation: boolean;
  hotel_assigned: boolean;
  pickup_assigned: boolean;
  is_vip: boolean;
  is_elderly: boolean;
  is_child: boolean;
  dietary_restrictions?: string;
  phone?: string;
}

interface Props {
  guests: IndividualGuest[];
  onGuestClick?: (guestId: string) => void;
}

/**
 * INDIVIDUALS VIEW
 *
 * Flat list of all guests with columns
 * Used for: Seating exports, check-in, edge cases
 * Heavy filtering support
 */
export function IndividualsView({ guests, onGuestClick }: Props) {
  if (guests.length === 0) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or add guests to your event
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-rose-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                Name
              </th>
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                Family
              </th>
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                Side
              </th>
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                RSVP
              </th>
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                Hotel
              </th>
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                Pickup
              </th>
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr
                key={guest.id}
                onClick={() => onGuestClick?.(guest.id)}
                className="border-b border-gray-100 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                {/* Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{guest.name}</span>
                    {guest.is_vip && (
                      <Star className="h-3 w-3 text-purple-600" />
                    )}
                  </div>
                </td>

                {/* Family */}
                <td className="py-3 px-4 text-gray-700">
                  {guest.family_name}
                </td>

                {/* Side */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      guest.family_side === 'bride'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {guest.family_side === 'bride' ? 'Bride' : 'Groom'}
                  </span>
                </td>

                {/* RSVP Status */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {guest.rsvp_status === 'confirmed' && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">Confirmed</span>
                      </>
                    )}
                    {guest.rsvp_status === 'declined' && (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-700">Declined</span>
                      </>
                    )}
                    {guest.rsvp_status === 'maybe' && (
                      <>
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">Maybe</span>
                      </>
                    )}
                    {guest.rsvp_status === 'pending' && (
                      <>
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700">Pending</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Hotel */}
                <td className="py-3 px-4">
                  {guest.is_outstation ? (
                    <div className="flex items-center gap-1.5">
                      <Hotel className="h-4 w-4 text-gray-500" />
                      <span
                        className={`text-sm ${
                          guest.hotel_assigned
                            ? 'text-green-700 font-semibold'
                            : 'text-amber-700 font-semibold'
                        }`}
                      >
                        {guest.hotel_assigned ? 'Assigned' : 'Needed'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                {/* Pickup */}
                <td className="py-3 px-4">
                  {guest.is_outstation ? (
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span
                        className={`text-sm ${
                          guest.pickup_assigned
                            ? 'text-green-700 font-semibold'
                            : 'text-amber-700 font-semibold'
                        }`}
                      >
                        {guest.pickup_assigned ? 'Assigned' : 'Needed'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                {/* Tags */}
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {guest.is_elderly && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        Elderly
                      </span>
                    )}
                    {guest.is_child && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                        Child
                      </span>
                    )}
                    {guest.dietary_restrictions && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                        {guest.dietary_restrictions}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{guests.length}</span> guests
        </div>
      </div>
    </div>
  );
}
