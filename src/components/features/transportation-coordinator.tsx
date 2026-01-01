'use client';

import { useState } from 'react';
import {
  Car,
  Bus,
  MapPin,
  Clock,
  Users,
  Plus,
  Phone,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Navigation,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Vehicle {
  id: string;
  vehicle_type: 'car' | 'suv' | 'van' | 'bus' | 'tempo' | 'auto' | 'other';
  vehicle_name: string;
  capacity: number;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
}

interface Passenger {
  id: string;
  guest_id?: string;
  family_group_id?: string;
  passenger_name: string;
  passenger_count: number;
  pickup_confirmed: boolean;
}

interface Trip {
  id: string;
  trip_name: string;
  trip_type: 'pickup' | 'drop' | 'transfer' | 'venue_shuttle';
  pickup_location: string;
  pickup_time: string;
  drop_location: string;
  estimated_arrival?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  vehicle?: Vehicle;
  passengers: Passenger[];
}

interface TransportationCoordinatorProps {
  eventId: string;
  vehicles: Vehicle[];
  trips: Trip[];
  familiesNeedingTransport: {
    id: string;
    family_name: string;
    member_count: number;
    pickup_location?: string;
    arrival_time?: string;
  }[];
  onAddVehicle?: (vehicle: Partial<Vehicle>) => Promise<void>;
  onAddTrip?: (trip: Partial<Trip>) => Promise<void>;
  onAssignPassengers?: (tripId: string, passengerIds: string[]) => Promise<void>;
}

const VEHICLE_ICONS: Record<string, any> = {
  car: Car,
  suv: Car,
  van: Bus,
  bus: Bus,
  tempo: Bus,
  auto: Car,
  other: Car,
};

const VEHICLE_CAPACITIES: Record<string, number> = {
  car: 4,
  suv: 6,
  van: 12,
  bus: 40,
  tempo: 20,
  auto: 3,
  other: 4,
};

export function TransportationCoordinator({
  eventId,
  vehicles,
  trips,
  familiesNeedingTransport,
  onAddVehicle,
  onAddTrip,
  onAssignPassengers,
}: TransportationCoordinatorProps) {
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);

  const toggleTrip = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  // Calculate stats
  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  const assignedPassengers = trips.reduce(
    (sum, t) => sum + t.passengers.reduce((pSum, p) => pSum + p.passenger_count, 0),
    0
  );
  const pendingFamilies = familiesNeedingTransport.length;
  const totalNeedingTransport = familiesNeedingTransport.reduce(
    (sum, f) => sum + f.member_count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Car className="h-4 w-4" />
            <span className="text-sm">Vehicles</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
          <p className="text-xs text-gray-500">Capacity: {totalCapacity}</p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Navigation className="h-4 w-4" />
            <span className="text-sm">Trips</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{trips.length}</p>
          <p className="text-xs text-gray-500">Scheduled</p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Assigned</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{assignedPassengers}</p>
          <p className="text-xs text-gray-500">Passengers</p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{pendingFamilies}</p>
          <p className="text-xs text-gray-500">{totalNeedingTransport} people</p>
        </div>
      </div>

      {/* Families Needing Transport */}
      {familiesNeedingTransport.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5" />
            Families Needing Transportation
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {familiesNeedingTransport.map(family => (
              <div
                key={family.id}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100"
              >
                <div>
                  <p className="font-medium text-gray-900">{family.family_name}</p>
                  <p className="text-sm text-gray-600">{family.member_count} members</p>
                </div>
                {family.arrival_time && (
                  <span className="text-xs text-amber-600">
                    {format(new Date(family.arrival_time), 'dd MMM, h:mm a')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Car className="h-5 w-5 text-gray-600" />
            Vehicles
          </h3>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed">
            <Car className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No vehicles added yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(vehicle => {
              const VehicleIcon = VEHICLE_ICONS[vehicle.vehicle_type] || Car;
              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <VehicleIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{vehicle.vehicle_name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{vehicle.vehicle_type}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {vehicle.capacity}</span>
                    </div>
                    {vehicle.driver_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>Driver: {vehicle.driver_name}</span>
                      </div>
                    )}
                    {vehicle.driver_phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{vehicle.driver_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trips Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-gray-600" />
            Scheduled Trips
          </h3>
          <button
            onClick={() => setShowAddTrip(true)}
            className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed">
            <Navigation className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No trips scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => {
              const isExpanded = expandedTrips.has(trip.id);
              const passengerCount = trip.passengers.reduce(
                (sum, p) => sum + p.passenger_count,
                0
              );

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl border overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleTrip(trip.id)}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      trip.status === 'completed' && "bg-green-100 text-green-600",
                      trip.status === 'in_progress' && "bg-blue-100 text-blue-600",
                      trip.status === 'scheduled' && "bg-gray-100 text-gray-600",
                      trip.status === 'cancelled' && "bg-red-100 text-red-600",
                    )}>
                      <Navigation className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{trip.trip_name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(trip.pickup_time), 'dd MMM, h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {passengerCount} passengers
                        </span>
                      </div>
                    </div>

                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-gray-900">
                        {trip.pickup_location}
                      </p>
                      <p className="text-xs text-gray-500">
                        → {trip.drop_location}
                      </p>
                    </div>

                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      trip.status === 'completed' && "bg-green-100 text-green-700",
                      trip.status === 'in_progress' && "bg-blue-100 text-blue-700",
                      trip.status === 'scheduled' && "bg-gray-100 text-gray-700",
                      trip.status === 'cancelled' && "bg-red-100 text-red-700",
                    )}>
                      {trip.status}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
                      {/* Route Details */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span className="font-medium">{trip.pickup_location}</span>
                          </div>
                          <div className="ml-1.5 h-6 border-l-2 border-dashed border-gray-300" />
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="font-medium">{trip.drop_location}</span>
                          </div>
                        </div>
                        {trip.vehicle && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {trip.vehicle.vehicle_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {trip.vehicle.driver_name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Passengers */}
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Passengers</h5>
                      {trip.passengers.length === 0 ? (
                        <p className="text-sm text-gray-500">No passengers assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {trip.passengers.map(passenger => (
                            <div
                              key={passenger.id}
                              className="flex items-center justify-between bg-white rounded-lg p-2 border"
                            >
                              <span className="text-sm">{passenger.passenger_name}</span>
                              <span className="text-xs text-gray-500">
                                {passenger.passenger_count} people
                              </span>
                              {passenger.pickup_confirmed ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
