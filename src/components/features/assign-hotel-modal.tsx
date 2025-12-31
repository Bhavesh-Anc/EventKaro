'use client';

import { useState, useTransition } from 'react';
import { X, Hotel, Plus } from 'lucide-react';
import { assignHotelToFamily } from '@/actions/guests';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  familyName: string;
  roomsRequired: number;
  currentHotel?: string;
  currentRoomsAllocated?: number;
  availableHotels?: { name: string; roomsAvailable: number }[];
}

// Default hotel options - in production these would come from a hotels table
const DEFAULT_HOTELS = [
  { name: 'Taj Palace', roomsAvailable: 50 },
  { name: 'ITC Grand', roomsAvailable: 40 },
  { name: 'Oberoi', roomsAvailable: 30 },
  { name: 'Marriott', roomsAvailable: 45 },
  { name: 'Hyatt Regency', roomsAvailable: 35 },
];

export function AssignHotelModal({
  isOpen,
  onClose,
  familyId,
  familyName,
  roomsRequired,
  currentHotel,
  currentRoomsAllocated = 0,
  availableHotels = DEFAULT_HOTELS,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedHotel, setSelectedHotel] = useState(currentHotel || '');
  const [roomsToAllocate, setRoomsToAllocate] = useState(currentRoomsAllocated || roomsRequired);
  const [customHotel, setCustomHotel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hotelName = showCustomInput ? customHotel : selectedHotel;

    if (!hotelName) {
      setError('Please select or enter a hotel name');
      return;
    }

    if (roomsToAllocate <= 0) {
      setError('Please enter a valid number of rooms');
      return;
    }

    startTransition(async () => {
      const result = await assignHotelToFamily(familyId, hotelName, roomsToAllocate);

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
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-rose-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Hotel className="h-5 w-5 text-rose-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Assign Hotel</h2>
              <p className="text-sm text-gray-600">{familyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {success ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
              <Hotel className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">Hotel Assigned!</p>
              <p className="text-green-700 text-sm mt-1">
                {roomsToAllocate} room{roomsToAllocate !== 1 ? 's' : ''} at {showCustomInput ? customHotel : selectedHotel}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Rooms Required Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Rooms Required:</strong> {roomsRequired} room{roomsRequired !== 1 ? 's' : ''}
                </p>
                {currentHotel && (
                  <p className="text-sm text-amber-700 mt-1">
                    Currently at: {currentHotel} ({currentRoomsAllocated} rooms)
                  </p>
                )}
              </div>

              {/* Hotel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hotel
                </label>
                {!showCustomInput ? (
                  <>
                    <div className="space-y-2">
                      {availableHotels.map((hotel) => (
                        <button
                          key={hotel.name}
                          type="button"
                          onClick={() => setSelectedHotel(hotel.name)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            selectedHotel === hotel.name
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{hotel.name}</span>
                            <span className="text-sm text-gray-500">
                              {hotel.roomsAvailable} rooms available
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="mt-2 flex items-center gap-2 text-sm text-rose-700 hover:text-rose-800 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Custom Hotel
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customHotel}
                      onChange={(e) => setCustomHotel(e.target.value)}
                      placeholder="Enter hotel name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomHotel('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Back to hotel list
                    </button>
                  </div>
                )}
              </div>

              {/* Rooms to Allocate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rooms to Allocate
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={roomsToAllocate}
                  onChange={(e) => setRoomsToAllocate(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                  className="flex-1 px-4 py-2.5 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-800 disabled:opacity-50"
                >
                  {isPending ? 'Assigning...' : 'Assign Hotel'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
