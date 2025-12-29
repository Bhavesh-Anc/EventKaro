'use client';

import { Users, Hotel, Truck, Star, AlertTriangle, Phone, Send } from 'lucide-react';

export interface FamilyCardData {
  id: string;
  family_name: string;
  family_side: 'bride' | 'groom';
  total_members: number;
  members_confirmed: number;
  members_pending: number;
  members_declined: number;
  is_outstation: boolean;
  rooms_required: number;
  rooms_allocated: number;
  pickup_required: boolean;
  pickup_assigned: boolean;
  is_vip: boolean;
  primary_contact_name?: string;
  primary_contact_phone?: string;
}

interface Props {
  family: FamilyCardData;
  onClick: () => void;
}

/**
 * FAMILY CARD
 *
 * One household. One RSVP decision unit.
 * Shows: Name, Side, Members, RSVP Status, Logistics Needs, VIP Badge
 */
export function FamilyCard({ family, onClick }: Props) {
  // Calculate RSVP status color
  const allResponded = family.members_pending === 0;
  const allConfirmed = family.members_confirmed === family.total_members;
  const allDeclined = family.members_declined === family.total_members;
  const partialResponse = family.members_confirmed > 0 && family.members_pending > 0;

  let rsvpStatusColor = 'bg-amber-100 text-amber-800 border-amber-200';
  let rsvpStatusText = 'Pending';

  if (allConfirmed) {
    rsvpStatusColor = 'bg-green-100 text-green-800 border-green-200';
    rsvpStatusText = 'All Confirmed';
  } else if (allDeclined) {
    rsvpStatusColor = 'bg-red-100 text-red-800 border-red-200';
    rsvpStatusText = 'Declined';
  } else if (partialResponse) {
    rsvpStatusColor = 'bg-blue-100 text-blue-800 border-blue-200';
    rsvpStatusText = 'Partial';
  }

  // Check for issues
  const hasIssues =
    (family.is_outstation && family.rooms_required > family.rooms_allocated) ||
    (family.pickup_required && !family.pickup_assigned);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
        hasIssues
          ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
          : 'border-gray-200 bg-white hover:border-rose-300'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{family.family_name}</h3>
            {family.is_vip && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                <Star className="h-3 w-3" />
                VIP
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              family.family_side === 'bride'
                ? 'bg-pink-100 text-pink-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {family.family_side === 'bride' ? "Bride's Side" : "Groom's Side"}
            </span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${rsvpStatusColor}`}>
          {rsvpStatusText}
        </div>
      </div>

      {/* Members Count */}
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">
          {family.total_members} {family.total_members === 1 ? 'member' : 'members'}
        </span>
        {family.members_pending > 0 && (
          <span className="text-xs text-gray-500">
            ({family.members_confirmed} confirmed, {family.members_pending} pending)
          </span>
        )}
      </div>

      {/* Logistics Indicators */}
      <div className="flex flex-wrap gap-2 mb-3">
        {family.is_outstation && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
            family.rooms_required > family.rooms_allocated
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <Hotel className="h-3 w-3" />
            <span>
              Rooms: {family.rooms_allocated}/{family.rooms_required}
            </span>
          </div>
        )}

        {family.pickup_required && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
            !family.pickup_assigned
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <Truck className="h-3 w-3" />
            <span>
              Pickup {family.pickup_assigned ? 'Assigned' : 'Needed'}
            </span>
          </div>
        )}
      </div>

      {/* Contact & Actions */}
      {family.primary_contact_phone && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-3 w-3" />
            <span>{family.primary_contact_name || 'Contact'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${family.primary_contact_phone?.replace(/\D/g, '')}`, '_blank');
              }}
              className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              title="Send WhatsApp message"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Issue Alert */}
      {hasIssues && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-300 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            {family.rooms_required > family.rooms_allocated && 'Hotel room needed. '}
            {family.pickup_required && !family.pickup_assigned && 'Pickup not assigned.'}
          </span>
        </div>
      )}
    </button>
  );
}
