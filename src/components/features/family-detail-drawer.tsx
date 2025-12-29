'use client';

import { X, Users, Hotel, Truck, DollarSign, MessageCircle, Edit, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { FamilyCardData } from './family-card';

export interface FamilyMember {
  id: string;
  name: string;
  age?: number;
  rsvp_status: 'pending' | 'confirmed' | 'declined' | 'maybe';
  dietary_restrictions?: string;
  is_elderly: boolean;
  is_child: boolean;
  is_vip: boolean;
}

export interface RSVPHistoryEntry {
  id: string;
  member_name: string;
  status: string;
  changed_at: string;
  is_late: boolean;
}

interface Props {
  family: FamilyCardData;
  members: FamilyMember[];
  rsvpHistory: RSVPHistoryEntry[];
  costImpact: {
    catering: number;
    rooms: number;
    transport: number;
    total: number;
  };
  onClose: () => void;
}

/**
 * FAMILY DETAIL DRAWER
 *
 * Opens on the right side when a family card is clicked
 * Shows: Metadata, Members, RSVP History, Logistics, Cost Impact
 */
export function FamilyDetailDrawer({
  family,
  members,
  rsvpHistory,
  costImpact,
  onClose,
}: Props) {
  const lateConfirmations = rsvpHistory.filter((h) => h.is_late && h.status === 'confirmed');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-rose-700 to-rose-900 text-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{family.family_name}</h2>
                {family.is_vip && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-bold">
                    <Star className="h-3 w-3" />
                    VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                  {family.family_side === 'bride' ? "Bride's Side" : "Groom's Side"}
                </span>
                <span className="text-rose-100 text-sm">
                  {family.total_members} {family.total_members === 1 ? 'member' : 'members'}
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
          {/* SECTION A - Family Metadata */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Family Information
            </h3>
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              {family.primary_contact_name && (
                <div>
                  <div className="text-xs text-gray-600">Primary Contact</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {family.primary_contact_name}
                  </div>
                  {family.primary_contact_phone && (
                    <div className="text-sm text-gray-600">{family.primary_contact_phone}</div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (family.primary_contact_phone) {
                      window.open(
                        `https://wa.me/${family.primary_contact_phone.replace(/\D/g, '')}`,
                        '_blank'
                      );
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send RSVP Reminder
                </button>
              </div>
            </div>
          </div>

          {/* SECTION B - Members List */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Family Members ({members.length})
            </h3>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {member.name}
                        </div>
                        {member.age && (
                          <span className="text-xs text-gray-500">({member.age}y)</span>
                        )}
                        {member.is_vip && (
                          <Star className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {member.is_elderly && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Elderly
                          </span>
                        )}
                        {member.is_child && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            Child
                          </span>
                        )}
                        {member.dietary_restrictions && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {member.dietary_restrictions}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          member.rsvp_status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : member.rsvp_status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : member.rsvp_status === 'maybe'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {member.rsvp_status.charAt(0).toUpperCase() + member.rsvp_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C - RSVP History */}
          {rsvpHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                RSVP History
              </h3>
              <div className="space-y-2">
                {rsvpHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg border p-3 ${
                      entry.is_late
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">
                          {entry.member_name}
                        </span>{' '}
                        <span className="text-gray-600">changed to</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {entry.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(parseISO(entry.changed_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                    {entry.is_late && (
                      <div className="text-xs text-red-700 mt-1 font-semibold">
                        ⚠️ After RSVP cutoff
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D - Logistics Needs */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Logistics
            </h3>
            <div className="space-y-3">
              {/* Hotel */}
              {family.is_outstation && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Hotel className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Hotel Accommodation
                      </div>
                      <div className="text-xs text-gray-600">
                        {family.rooms_allocated}/{family.rooms_required} rooms assigned
                      </div>
                    </div>
                    {family.rooms_required > family.rooms_allocated ? (
                      <button className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-semibold transition-all">
                        Assign Hotel
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Transport */}
              {family.pickup_required && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Pickup & Transport
                      </div>
                      <div className="text-xs text-gray-600">
                        {family.pickup_assigned ? 'Assigned' : 'Not assigned'}
                      </div>
                    </div>
                    {!family.pickup_assigned ? (
                      <button className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-semibold transition-all">
                        Assign Pickup
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION E - Cost Impact (Private - Organizer Only) */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Cost Impact
            </h3>
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-amber-700" />
                <div className="text-sm font-bold text-amber-900">
                  Estimated Family Cost
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-amber-700">Catering</div>
                  <div className="font-semibold text-amber-900">
                    ₹{costImpact.catering.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-amber-700">Rooms</div>
                  <div className="font-semibold text-amber-900">
                    ₹{costImpact.rooms.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-amber-700">Transport</div>
                  <div className="font-semibold text-amber-900">
                    ₹{costImpact.transport.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-amber-700 font-bold">Total</div>
                  <div className="font-bold text-amber-900 text-lg">
                    ₹{costImpact.total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-300 text-xs text-amber-800">
                💡 This estimate is private and visible only to organizers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
