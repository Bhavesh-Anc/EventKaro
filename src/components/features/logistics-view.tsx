'use client';

import { Hotel, Truck, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';

export interface LogisticsGuest {
  id: string;
  name: string;
  family_name: string;
  family_id: string;
  family_side: 'bride' | 'groom';
  phone?: string;
}

export interface HotelAssignment {
  hotel_name: string;
  guests: LogisticsGuest[];
  rooms_allocated: number;
  total_capacity: number;
}

export interface PickupAssignment {
  pickup_time: string;
  pickup_location: string;
  vehicle_type?: string;
  guests: LogisticsGuest[];
  seats_allocated: number;
  total_capacity: number;
}

interface Props {
  hotelAssignments: HotelAssignment[];
  pickupAssignments: PickupAssignment[];
  guestsNeedingHotel: LogisticsGuest[];
  guestsNeedingPickup: LogisticsGuest[];
  onFamilyClick?: (familyId: string) => void;
}

/**
 * LOGISTICS VIEW
 *
 * Read-only projection showing:
 * - Guests needing hotels (unassigned)
 * - Guests needing transport (unassigned)
 * - Hotel assignments (grouped)
 * - Pickup assignments (grouped)
 *
 * Deep-links back to Family for fixes
 */
export function LogisticsView({
  hotelAssignments,
  pickupAssignments,
  guestsNeedingHotel,
  guestsNeedingPickup,
  onFamilyClick,
}: Props) {
  const totalNeedingHotel = guestsNeedingHotel.length;
  const totalNeedingPickup = guestsNeedingPickup.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Hotels Summary */}
        <div className={`rounded-xl border-2 p-6 ${
          totalNeedingHotel > 0
            ? 'border-amber-300 bg-amber-50'
            : 'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Hotel className={`h-6 w-6 ${
              totalNeedingHotel > 0 ? 'text-amber-700' : 'text-green-700'
            }`} />
            <h3 className="text-lg font-bold text-gray-900">Hotel Accommodation</h3>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            totalNeedingHotel > 0 ? 'text-amber-900' : 'text-green-900'
          }`}>
            {totalNeedingHotel}
          </div>
          <div className={`text-sm ${
            totalNeedingHotel > 0 ? 'text-amber-700' : 'text-green-700'
          }`}>
            {totalNeedingHotel > 0
              ? `${totalNeedingHotel} guests need hotel assignment`
              : 'All outstation guests have hotels'}
          </div>
        </div>

        {/* Transport Summary */}
        <div className={`rounded-xl border-2 p-6 ${
          totalNeedingPickup > 0
            ? 'border-amber-300 bg-amber-50'
            : 'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Truck className={`h-6 w-6 ${
              totalNeedingPickup > 0 ? 'text-amber-700' : 'text-green-700'
            }`} />
            <h3 className="text-lg font-bold text-gray-900">Pickup & Transport</h3>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            totalNeedingPickup > 0 ? 'text-amber-900' : 'text-green-900'
          }`}>
            {totalNeedingPickup}
          </div>
          <div className={`text-sm ${
            totalNeedingPickup > 0 ? 'text-amber-700' : 'text-green-700'
          }`}>
            {totalNeedingPickup > 0
              ? `${totalNeedingPickup} guests need pickup assignment`
              : 'All pickups assigned'}
          </div>
        </div>
      </div>

      {/* Unassigned Hotel Guests */}
      {guestsNeedingHotel.length > 0 && (
        <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Guests Needing Hotel Assignment ({guestsNeedingHotel.length})
              </h3>
            </div>
            <div className="space-y-2">
              {guestsNeedingHotel.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => onFamilyClick?.(guest.family_id)}
                  className="w-full text-left rounded-lg border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{guest.name}</div>
                      <div className="text-sm text-gray-600">
                        {guest.family_name} •{' '}
                        <span className="capitalize">{guest.family_side}'s side</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-amber-700">
                      Click to assign →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Pickup Guests */}
      {guestsNeedingPickup.length > 0 && (
        <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Guests Needing Pickup Assignment ({guestsNeedingPickup.length})
              </h3>
            </div>
            <div className="space-y-2">
              {guestsNeedingPickup.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => onFamilyClick?.(guest.family_id)}
                  className="w-full text-left rounded-lg border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{guest.name}</div>
                      <div className="text-sm text-gray-600">
                        {guest.family_name} •{' '}
                        <span className="capitalize">{guest.family_side}'s side</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-amber-700">
                      Click to assign →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hotel Assignments (Grouped) */}
      {hotelAssignments.length > 0 && (
        <div className="rounded-xl border-2 border-rose-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="h-5 w-5 text-rose-700" />
              <h3 className="text-lg font-bold text-gray-900">
                Hotel Assignments ({hotelAssignments.length} hotels)
              </h3>
            </div>
            <div className="space-y-4">
              {hotelAssignments.map((hotel, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{hotel.hotel_name}</div>
                      <div className="text-sm text-gray-600">
                        {hotel.guests.length} guests • {hotel.rooms_allocated} rooms
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        {hotel.rooms_allocated}/{hotel.total_capacity} capacity
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hotel.guests.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => onFamilyClick?.(guest.family_id)}
                        className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 transition-colors"
                      >
                        {guest.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pickup Assignments (Grouped) */}
      {pickupAssignments.length > 0 && (
        <div className="rounded-xl border-2 border-rose-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-rose-700" />
              <h3 className="text-lg font-bold text-gray-900">
                Pickup Assignments ({pickupAssignments.length} pickups)
              </h3>
            </div>
            <div className="space-y-4">
              {pickupAssignments.map((pickup, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900">
                        {pickup.pickup_time} • {pickup.pickup_location}
                      </div>
                      <div className="text-sm text-gray-600">
                        {pickup.guests.length} guests
                        {pickup.vehicle_type && ` • ${pickup.vehicle_type}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        {pickup.seats_allocated}/{pickup.total_capacity} capacity
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pickup.guests.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => onFamilyClick?.(guest.family_id)}
                        className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 transition-colors"
                      >
                        {guest.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalNeedingHotel === 0 &&
        totalNeedingPickup === 0 &&
        hotelAssignments.length === 0 &&
        pickupAssignments.length === 0 && (
          <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No logistics requirements
            </h3>
            <p className="text-gray-600">
              Add outstation guests to start tracking hotels and transport
            </p>
          </div>
        )}
    </div>
  );
}
