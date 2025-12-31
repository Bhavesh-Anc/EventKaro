'use client';

import { useState, useTransition } from 'react';
import { X, User, Hotel, Truck, CheckCircle2, XCircle, Clock, HelpCircle, MessageCircle, Star, Phone } from 'lucide-react';
import { updateGuestRSVP } from '@/actions/guests';
import { useRouter } from 'next/navigation';

export interface GuestDetail {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  family_name: string;
  family_side: 'bride' | 'groom';
  rsvp_status: 'pending' | 'accepted' | 'declined' | 'maybe' | 'no_response';
  is_outstation: boolean;
  hotel_assigned: boolean;
  pickup_assigned: boolean;
  is_vip: boolean;
  is_elderly: boolean;
  is_child: boolean;
}

interface Props {
  guest: GuestDetail;
  eventId: string;
  onClose: () => void;
}

/**
 * GUEST DETAIL DRAWER
 *
 * Shows individual guest details with RSVP update functionality
 */
export function GuestDetailDrawer({ guest, eventId, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(guest.rsvp_status);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
    { value: 'accepted', label: 'Attending', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    { value: 'declined', label: 'Not Attending', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'maybe', label: 'Maybe', color: 'bg-blue-100 text-blue-800', icon: HelpCircle },
  ];

  const handleStatusChange = (status: string) => {
    if (status === currentStatus) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateGuestRSVP(guest.id, status);
      if (result?.error) {
        setError(result.error);
      } else {
        setCurrentStatus(status as any);
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      }
    });
  };

  const currentStatusConfig = statuses.find(s => s.value === currentStatus) || statuses[0];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-rose-700 to-rose-900 text-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{guest.name}</h2>
                {guest.is_vip && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-bold">
                    <Star className="h-3 w-3" />
                    VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                  {guest.family_name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                  {guest.family_side === 'bride' ? "Bride's Side" : "Groom's Side"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status Display */}
          <div className="rounded-xl border-2 border-gray-200 p-6 bg-gray-50">
            <div className="text-sm font-semibold text-gray-600 mb-2">Current RSVP Status</div>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-8 w-8 ${
                currentStatus === 'accepted' ? 'text-green-600' :
                currentStatus === 'declined' ? 'text-red-600' :
                currentStatus === 'maybe' ? 'text-blue-600' :
                'text-amber-600'
              }`} />
              <span className={`text-2xl font-bold ${
                currentStatus === 'accepted' ? 'text-green-700' :
                currentStatus === 'declined' ? 'text-red-700' :
                currentStatus === 'maybe' ? 'text-blue-700' :
                'text-amber-700'
              }`}>
                {currentStatusConfig.label}
              </span>
            </div>
          </div>

          {/* RSVP Update Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Update RSVP Status
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-semibold">
                RSVP status updated successfully!
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {statuses.map((status) => {
                const Icon = status.icon;
                const isActive = currentStatus === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handleStatusChange(status.value)}
                    disabled={isPending || isActive}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? `${status.color} border-current ring-2 ring-current`
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <Icon className={`h-6 w-6 ${
                      status.value === 'accepted' ? 'text-green-600' :
                      status.value === 'declined' ? 'text-red-600' :
                      status.value === 'maybe' ? 'text-blue-600' :
                      'text-amber-600'
                    }`} />
                    <span className="font-semibold text-gray-900">{status.label}</span>
                  </button>
                );
              })}
            </div>

            {isPending && (
              <div className="mt-3 text-center text-sm text-gray-600">
                Updating status...
              </div>
            )}
          </div>

          {/* Guest Tags */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Guest Details
            </h3>
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {guest.is_elderly && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                    Elderly
                  </span>
                )}
                {guest.is_child && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                    Child
                  </span>
                )}
                {guest.is_outstation && (
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold">
                    Outstation
                  </span>
                )}
                {!guest.is_elderly && !guest.is_child && !guest.is_outstation && (
                  <span className="text-gray-500 text-sm">No special tags</span>
                )}
              </div>

              {guest.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{guest.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Logistics Status */}
          {guest.is_outstation && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Logistics Status
              </h3>
              <div className="space-y-3">
                {/* Hotel */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Hotel className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Hotel Accommodation
                      </div>
                      <div className={`text-xs ${
                        guest.hotel_assigned ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {guest.hotel_assigned ? 'Assigned' : 'Not assigned'}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      guest.hotel_assigned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {guest.hotel_assigned ? 'Done' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Pickup */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Pickup & Transport
                      </div>
                      <div className={`text-xs ${
                        guest.pickup_assigned ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {guest.pickup_assigned ? 'Assigned' : 'Not assigned'}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      guest.pickup_assigned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {guest.pickup_assigned ? 'Done' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="flex gap-3">
              {guest.phone && (
                <button
                  onClick={() => {
                    window.open(`https://wa.me/${guest.phone?.replace(/\D/g, '')}`, '_blank');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  Send WhatsApp
                </button>
              )}
              {guest.phone && (
                <button
                  onClick={() => {
                    window.open(`tel:${guest.phone}`, '_self');
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all"
                >
                  <Phone className="h-5 w-5" />
                  Call
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
