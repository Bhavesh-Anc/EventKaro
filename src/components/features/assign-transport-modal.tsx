'use client';

import { useState, useTransition } from 'react';
import { X, Truck, Plane, Train, Bus, Car, MapPin } from 'lucide-react';
import { assignPickupToFamily } from '@/actions/guests';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  familyName: string;
  guestArrivalInfo?: {
    date?: string;
    time?: string;
    location?: string;
    locationType?: 'airport' | 'railway_station' | 'bus_station' | 'car' | 'other';
    flightTrainNumber?: string;
  };
}

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan (4 passengers)', icon: Car },
  { value: 'suv', label: 'SUV (6 passengers)', icon: Car },
  { value: 'van', label: 'Tempo Traveller (12 passengers)', icon: Bus },
  { value: 'bus', label: 'Mini Bus (20+ passengers)', icon: Bus },
];

const PICKUP_LOCATIONS = [
  { value: 'airport', label: 'Airport', icon: Plane },
  { value: 'railway_station', label: 'Railway Station', icon: Train },
  { value: 'bus_station', label: 'Bus Station', icon: Bus },
  { value: 'other', label: 'Other Location', icon: MapPin },
];

export function AssignTransportModal({
  isOpen,
  onClose,
  familyId,
  familyName,
  guestArrivalInfo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pickupDate, setPickupDate] = useState(guestArrivalInfo?.date || '');
  const [pickupTime, setPickupTime] = useState(guestArrivalInfo?.time || '');
  const [locationType, setLocationType] = useState(guestArrivalInfo?.locationType || 'airport');
  const [pickupLocation, setPickupLocation] = useState(guestArrivalInfo?.location || '');
  const [vehicleType, setVehicleType] = useState('sedan');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupDate || !pickupTime) {
      setError('Please enter pickup date and time');
      return;
    }

    if (!pickupLocation) {
      setError('Please enter pickup location');
      return;
    }

    const fullPickupTime = `${pickupDate}T${pickupTime}`;
    const fullLocation = `${pickupLocation}${notes ? ` (${notes})` : ''}`;

    startTransition(async () => {
      const result = await assignPickupToFamily(
        familyId,
        fullPickupTime,
        fullLocation,
        vehicleType
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1000);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Assign Transport</h2>
              <p className="text-sm text-gray-600">{familyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {success ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
              <Truck className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">Transport Assigned!</p>
              <p className="text-green-700 text-sm mt-1">
                Pickup scheduled for {pickupDate} at {pickupTime}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Guest Arrival Info (if available) */}
              {guestArrivalInfo && (guestArrivalInfo.date || guestArrivalInfo.flightTrainNumber) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">Guest Arrival Info</p>
                  {guestArrivalInfo.date && (
                    <p className="text-sm text-blue-800">
                      Date: {guestArrivalInfo.date} {guestArrivalInfo.time && `at ${guestArrivalInfo.time}`}
                    </p>
                  )}
                  {guestArrivalInfo.flightTrainNumber && (
                    <p className="text-sm text-blue-800">
                      Flight/Train: {guestArrivalInfo.flightTrainNumber}
                    </p>
                  )}
                  {guestArrivalInfo.location && (
                    <p className="text-sm text-blue-800">
                      Location: {guestArrivalInfo.location}
                    </p>
                  )}
                </div>
              )}

              {/* Pickup Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup From
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PICKUP_LOCATIONS.map((loc) => {
                    const Icon = loc.icon;
                    return (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => setLocationType(loc.value as any)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          locationType === loc.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{loc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pickup Location Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Details *
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g., Indira Gandhi International Airport, Terminal 3"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <div className="space-y-2">
                  {VEHICLE_TYPES.map((vehicle) => {
                    const Icon = vehicle.icon;
                    return (
                      <button
                        key={vehicle.value}
                        type="button"
                        onClick={() => setVehicleType(vehicle.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                          vehicleType === vehicle.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium">{vehicle.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Driver Details (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any special instructions..."
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
                >
                  {isPending ? 'Assigning...' : 'Assign Transport'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
