'use client';

import { useState } from 'react';
import { Hotel, Truck, Plane, Train, Bus, Car, AlertTriangle, CheckCircle2, Users, Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface LogisticsGuest {
  id: string;
  name: string;
  family_name: string;
  family_id: string;
  family_side: 'bride' | 'groom';
  phone?: string;
}

export interface GuestTravelDetails {
  id: string;
  name: string;
  family_name: string;
  family_id: string;
  family_side: 'bride' | 'groom';
  phone?: string;
  // Arrival
  arrival_date?: string;
  arrival_time?: string;
  arrival_location?: string;
  arrival_location_type?: 'airport' | 'railway_station' | 'bus_station' | 'car' | 'other';
  arrival_flight_train_number?: string;
  arrival_needs_pickup: boolean;
  arrival_notes?: string;
  // Departure
  departure_date?: string;
  departure_time?: string;
  departure_location?: string;
  departure_location_type?: 'airport' | 'railway_station' | 'bus_station' | 'car' | 'other';
  departure_flight_train_number?: string;
  departure_needs_dropoff: boolean;
  departure_notes?: string;
  // Accommodation
  needs_accommodation: boolean;
  accommodation_check_in?: string;
  accommodation_check_out?: string;
  accommodation_preferences?: string;
  hotel_assigned?: string;
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
  guestTravelDetails?: GuestTravelDetails[];
  onFamilyClick?: (familyId: string) => void;
}

type TabType = 'overview' | 'arrivals' | 'departures' | 'accommodation';

const getLocationIcon = (type?: string) => {
  switch (type) {
    case 'airport':
      return Plane;
    case 'railway_station':
      return Train;
    case 'bus_station':
      return Bus;
    case 'car':
      return Car;
    default:
      return MapPin;
  }
};

const formatLocationType = (type?: string) => {
  switch (type) {
    case 'airport':
      return 'Airport';
    case 'railway_station':
      return 'Railway Station';
    case 'bus_station':
      return 'Bus Station';
    case 'car':
      return 'By Car';
    default:
      return 'Other';
  }
};

/**
 * LOGISTICS VIEW
 *
 * Shows travel details from RSVP forms:
 * - Arrivals grouped by date/time/location
 * - Departures grouped by date/time/location
 * - Accommodation needs with check-in/out dates
 * - Hotel and pickup assignments
 */
export function LogisticsView({
  hotelAssignments,
  pickupAssignments,
  guestsNeedingHotel,
  guestsNeedingPickup,
  guestTravelDetails = [],
  onFamilyClick,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter guests with travel details
  const guestsWithArrivals = guestTravelDetails.filter(g => g.arrival_date);
  const guestsNeedingPickupFromRSVP = guestTravelDetails.filter(g => g.arrival_needs_pickup && g.arrival_date);
  const guestsWithDepartures = guestTravelDetails.filter(g => g.departure_date);
  const guestsNeedingDropoff = guestTravelDetails.filter(g => g.departure_needs_dropoff && g.departure_date);
  const guestsNeedingAccommodation = guestTravelDetails.filter(g => g.needs_accommodation);
  const guestsWithoutHotel = guestsNeedingAccommodation.filter(g => !g.hotel_assigned);

  // Group arrivals by date
  const arrivalsByDate = guestsWithArrivals.reduce((acc, guest) => {
    const date = guest.arrival_date!;
    if (!acc[date]) acc[date] = [];
    acc[date].push(guest);
    return acc;
  }, {} as Record<string, GuestTravelDetails[]>);

  // Group departures by date
  const departuresByDate = guestsWithDepartures.reduce((acc, guest) => {
    const date = guest.departure_date!;
    if (!acc[date]) acc[date] = [];
    acc[date].push(guest);
    return acc;
  }, {} as Record<string, GuestTravelDetails[]>);

  // Group accommodation by check-in date
  const accommodationByCheckIn = guestsNeedingAccommodation.reduce((acc, guest) => {
    const date = guest.accommodation_check_in || 'unspecified';
    if (!acc[date]) acc[date] = [];
    acc[date].push(guest);
    return acc;
  }, {} as Record<string, GuestTravelDetails[]>);

  const totalNeedingHotel = guestsNeedingHotel.length + guestsWithoutHotel.length;
  const totalNeedingPickup = guestsNeedingPickup.length + guestsNeedingPickupFromRSVP.length;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'arrivals', label: `Arrivals (${guestsWithArrivals.length})` },
          { key: 'departures', label: `Departures (${guestsWithDepartures.length})` },
          { key: 'accommodation', label: `Accommodation (${guestsNeedingAccommodation.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Arrivals Summary */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Plane className="h-6 w-6 text-blue-700" />
                <h3 className="text-lg font-bold text-gray-900">Arrivals</h3>
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {guestsWithArrivals.length}
              </div>
              <div className="text-sm text-blue-700">
                {guestsNeedingPickupFromRSVP.length} need pickup
              </div>
            </div>

            {/* Departures Summary */}
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Plane className="h-6 w-6 text-purple-700" />
                <h3 className="text-lg font-bold text-gray-900">Departures</h3>
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-1">
                {guestsWithDepartures.length}
              </div>
              <div className="text-sm text-purple-700">
                {guestsNeedingDropoff.length} need drop-off
              </div>
            </div>

            {/* Hotels Summary */}
            <div className={`rounded-xl border-2 p-5 ${
              totalNeedingHotel > 0
                ? 'border-amber-300 bg-amber-50'
                : 'border-green-300 bg-green-50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Hotel className={`h-6 w-6 ${
                  totalNeedingHotel > 0 ? 'text-amber-700' : 'text-green-700'
                }`} />
                <h3 className="text-lg font-bold text-gray-900">Accommodation</h3>
              </div>
              <div className={`text-3xl font-bold mb-1 ${
                totalNeedingHotel > 0 ? 'text-amber-900' : 'text-green-900'
              }`}>
                {guestsNeedingAccommodation.length}
              </div>
              <div className={`text-sm ${
                totalNeedingHotel > 0 ? 'text-amber-700' : 'text-green-700'
              }`}>
                {totalNeedingHotel > 0
                  ? `${guestsWithoutHotel.length} need hotel`
                  : 'All assigned'}
              </div>
            </div>

            {/* Transport Summary */}
            <div className={`rounded-xl border-2 p-5 ${
              totalNeedingPickup > 0
                ? 'border-amber-300 bg-amber-50'
                : 'border-green-300 bg-green-50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Truck className={`h-6 w-6 ${
                  totalNeedingPickup > 0 ? 'text-amber-700' : 'text-green-700'
                }`} />
                <h3 className="text-lg font-bold text-gray-900">Transport</h3>
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
                  ? 'guests need transport'
                  : 'All pickups assigned'}
              </div>
            </div>
          </div>

          {/* Guests Needing Pickup */}
          {guestsNeedingPickupFromRSVP.length > 0 && (
            <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Guests Needing Pickup ({guestsNeedingPickupFromRSVP.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {guestsNeedingPickupFromRSVP.slice(0, 5).map((guest) => {
                    const Icon = getLocationIcon(guest.arrival_location_type);
                    return (
                      <button
                        key={guest.id}
                        onClick={() => onFamilyClick?.(guest.family_id)}
                        className="w-full text-left rounded-lg border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{guest.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Icon className="h-3 w-3" />
                              {guest.arrival_location || formatLocationType(guest.arrival_location_type)}
                              {guest.arrival_date && (
                                <span>• {format(parseISO(guest.arrival_date), 'MMM d')}</span>
                              )}
                              {guest.arrival_time && (
                                <span>@ {guest.arrival_time}</span>
                              )}
                            </div>
                            {guest.arrival_flight_train_number && (
                              <div className="text-xs text-gray-500 mt-1">
                                {guest.arrival_flight_train_number}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-amber-700">
                            Assign →
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {guestsNeedingPickupFromRSVP.length > 5 && (
                    <button
                      onClick={() => setActiveTab('arrivals')}
                      className="w-full text-center py-2 text-sm font-semibold text-amber-700 hover:text-amber-900"
                    >
                      View all {guestsNeedingPickupFromRSVP.length} guests →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guests Without Hotel */}
          {guestsWithoutHotel.length > 0 && (
            <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hotel className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Guests Needing Hotel ({guestsWithoutHotel.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {guestsWithoutHotel.slice(0, 5).map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => onFamilyClick?.(guest.family_id)}
                      className="w-full text-left rounded-lg border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{guest.name}</div>
                          <div className="text-sm text-gray-600">
                            {guest.family_name} •{' '}
                            {guest.accommodation_check_in && guest.accommodation_check_out && (
                              <span>
                                {format(parseISO(guest.accommodation_check_in), 'MMM d')} - {format(parseISO(guest.accommodation_check_out), 'MMM d')}
                              </span>
                            )}
                          </div>
                          {guest.accommodation_preferences && (
                            <div className="text-xs text-gray-500 mt-1">
                              {guest.accommodation_preferences}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-amber-700">
                          Assign →
                        </div>
                      </div>
                    </button>
                  ))}
                  {guestsWithoutHotel.length > 5 && (
                    <button
                      onClick={() => setActiveTab('accommodation')}
                      className="w-full text-center py-2 text-sm font-semibold text-amber-700 hover:text-amber-900"
                    >
                      View all {guestsWithoutHotel.length} guests →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hotel Assignments */}
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

          {/* Empty State */}
          {guestTravelDetails.length === 0 &&
            hotelAssignments.length === 0 &&
            pickupAssignments.length === 0 && (
              <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No travel details yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Send RSVP forms to guests to collect their travel information
                </p>
                <p className="text-sm text-gray-500">
                  Once guests fill their arrival, departure, and accommodation details, they'll appear here
                </p>
              </div>
            )}
        </>
      )}

      {/* Arrivals Tab */}
      {activeTab === 'arrivals' && (
        <div className="space-y-4">
          {Object.keys(arrivalsByDate).length === 0 ? (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
              <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No arrival details yet
              </h3>
              <p className="text-gray-600">
                Guests haven't submitted their arrival information
              </p>
            </div>
          ) : (
            Object.entries(arrivalsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, guests]) => (
                <div key={date} className="rounded-xl border-2 border-blue-200 bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection(`arrival-${date}`)}
                    className="w-full p-4 bg-blue-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-700" />
                      <div className="text-left">
                        <div className="font-bold text-gray-900">
                          {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-blue-700">
                          {guests.length} guests arriving • {guests.filter(g => g.arrival_needs_pickup).length} need pickup
                        </div>
                      </div>
                    </div>
                    {expandedSections[`arrival-${date}`] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections[`arrival-${date}`] && (
                    <div className="p-4 space-y-3">
                      {guests
                        .sort((a, b) => (a.arrival_time || '').localeCompare(b.arrival_time || ''))
                        .map((guest) => {
                          const Icon = getLocationIcon(guest.arrival_location_type);
                          return (
                            <div
                              key={guest.id}
                              className={`rounded-lg border p-4 ${
                                guest.arrival_needs_pickup
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{guest.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                      {guest.family_name}
                                    </span>
                                    {guest.arrival_needs_pickup && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-semibold">
                                        Needs Pickup
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {guest.arrival_time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {guest.arrival_time}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Icon className="h-4 w-4" />
                                      {guest.arrival_location || formatLocationType(guest.arrival_location_type)}
                                    </div>
                                  </div>
                                  {guest.arrival_flight_train_number && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {guest.arrival_location_type === 'airport' ? 'Flight' : 'Train/Bus'}: {guest.arrival_flight_train_number}
                                    </div>
                                  )}
                                  {guest.arrival_notes && (
                                    <div className="text-xs text-gray-500 mt-2 italic">
                                      "{guest.arrival_notes}"
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => onFamilyClick?.(guest.family_id)}
                                  className="px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  View Family
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* Departures Tab */}
      {activeTab === 'departures' && (
        <div className="space-y-4">
          {Object.keys(departuresByDate).length === 0 ? (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
              <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No departure details yet
              </h3>
              <p className="text-gray-600">
                Guests haven't submitted their departure information
              </p>
            </div>
          ) : (
            Object.entries(departuresByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, guests]) => (
                <div key={date} className="rounded-xl border-2 border-purple-200 bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection(`departure-${date}`)}
                    className="w-full p-4 bg-purple-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-700" />
                      <div className="text-left">
                        <div className="font-bold text-gray-900">
                          {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-purple-700">
                          {guests.length} guests departing • {guests.filter(g => g.departure_needs_dropoff).length} need drop-off
                        </div>
                      </div>
                    </div>
                    {expandedSections[`departure-${date}`] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections[`departure-${date}`] && (
                    <div className="p-4 space-y-3">
                      {guests
                        .sort((a, b) => (a.departure_time || '').localeCompare(b.departure_time || ''))
                        .map((guest) => {
                          const Icon = getLocationIcon(guest.departure_location_type);
                          return (
                            <div
                              key={guest.id}
                              className={`rounded-lg border p-4 ${
                                guest.departure_needs_dropoff
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{guest.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                      {guest.family_name}
                                    </span>
                                    {guest.departure_needs_dropoff && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-semibold">
                                        Needs Drop-off
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {guest.departure_time && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {guest.departure_time}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Icon className="h-4 w-4" />
                                      {guest.departure_location || formatLocationType(guest.departure_location_type)}
                                    </div>
                                  </div>
                                  {guest.departure_flight_train_number && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {guest.departure_location_type === 'airport' ? 'Flight' : 'Train/Bus'}: {guest.departure_flight_train_number}
                                    </div>
                                  )}
                                  {guest.departure_notes && (
                                    <div className="text-xs text-gray-500 mt-2 italic">
                                      "{guest.departure_notes}"
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => onFamilyClick?.(guest.family_id)}
                                  className="px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  View Family
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* Accommodation Tab */}
      {activeTab === 'accommodation' && (
        <div className="space-y-4">
          {guestsNeedingAccommodation.length === 0 ? (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
              <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No accommodation requests yet
              </h3>
              <p className="text-gray-600">
                Guests haven't submitted their accommodation needs
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                  <div className="text-2xl font-bold text-green-900">{guestsNeedingAccommodation.length}</div>
                  <div className="text-sm text-green-700">Total Requesting</div>
                </div>
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                  <div className="text-2xl font-bold text-amber-900">{guestsWithoutHotel.length}</div>
                  <div className="text-sm text-amber-700">Need Assignment</div>
                </div>
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <div className="text-2xl font-bold text-blue-900">{guestsNeedingAccommodation.length - guestsWithoutHotel.length}</div>
                  <div className="text-sm text-blue-700">Assigned</div>
                </div>
              </div>

              {/* By Check-in Date */}
              {Object.entries(accommodationByCheckIn)
                .sort(([a], [b]) => {
                  if (a === 'unspecified') return 1;
                  if (b === 'unspecified') return -1;
                  return a.localeCompare(b);
                })
                .map(([date, guests]) => (
                  <div key={date} className="rounded-xl border-2 border-rose-200 bg-white shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection(`accommodation-${date}`)}
                      className="w-full p-4 bg-rose-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Hotel className="h-5 w-5 text-rose-700" />
                        <div className="text-left">
                          <div className="font-bold text-gray-900">
                            {date === 'unspecified'
                              ? 'Check-in Date Not Specified'
                              : `Check-in: ${format(parseISO(date), 'EEEE, MMMM d, yyyy')}`}
                          </div>
                          <div className="text-sm text-rose-700">
                            {guests.length} guests • {guests.filter(g => !g.hotel_assigned).length} need hotel
                          </div>
                        </div>
                      </div>
                      {expandedSections[`accommodation-${date}`] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections[`accommodation-${date}`] && (
                      <div className="p-4 space-y-3">
                        {guests.map((guest) => (
                          <div
                            key={guest.id}
                            className={`rounded-lg border p-4 ${
                              guest.hotel_assigned
                                ? 'border-green-200 bg-green-50'
                                : 'border-amber-200 bg-amber-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{guest.name}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                    {guest.family_name}
                                  </span>
                                  {guest.hotel_assigned ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-semibold">
                                      {guest.hotel_assigned}
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-semibold">
                                      Needs Hotel
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {guest.accommodation_check_in && guest.accommodation_check_out && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {format(parseISO(guest.accommodation_check_in), 'MMM d')} - {format(parseISO(guest.accommodation_check_out), 'MMM d')}
                                    </div>
                                  )}
                                </div>
                                {guest.accommodation_preferences && (
                                  <div className="text-xs text-gray-500 mt-2 italic">
                                    Preferences: "{guest.accommodation_preferences}"
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => onFamilyClick?.(guest.family_id)}
                                className="px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                {guest.hotel_assigned ? 'View' : 'Assign'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
