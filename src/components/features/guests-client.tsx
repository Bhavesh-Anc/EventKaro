'use client';

import { useState } from 'react';
import { Users, List, Truck, Plus, Filter, Search, Upload, Send } from 'lucide-react';
import { FamilyCard, type FamilyCardData } from '@/components/features/family-card';
import { FamilyDetailDrawer, type FamilyMember, type RSVPHistoryEntry } from '@/components/features/family-detail-drawer';
import { IndividualsView, type IndividualGuest } from '@/components/features/individuals-view';
import { LogisticsView, type LogisticsGuest, type HotelAssignment, type PickupAssignment, type GuestTravelDetails } from '@/components/features/logistics-view';
import { CSVImportModal } from '@/components/features/csv-import-modal';
import { AddFamilyModal } from '@/components/features/add-family-modal';
import { GuestDetailDrawer, type GuestDetail } from '@/components/features/guest-detail-drawer';
import { RSVPStatsCards } from '@/components/features/rsvp-stats';
import { BulkRSVPActions } from '@/components/features/bulk-rsvp-actions';
import { useRouter } from 'next/navigation';

type ViewMode = 'families' | 'individuals' | 'logistics';
type FilterMode = 'all' | 'pending' | 'outstation' | 'vip' | 'no-hotel' | 'no-pickup';

interface RSVPStats {
  totalFamilies: number;
  totalGuests: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  maybeGuests: number;
  outstationGuests: number;
  needsHotel: number;
  needsPickup: number;
  rsvpResponseRate: number;
}

interface Props {
  families: FamilyCardData[];
  individuals: IndividualGuest[];
  logistics: {
    hotelAssignments: HotelAssignment[];
    pickupAssignments: PickupAssignment[];
    guestsNeedingHotel: LogisticsGuest[];
    guestsNeedingPickup: LogisticsGuest[];
    guestTravelDetails?: GuestTravelDetails[];
  };
  familyMembers: Record<string, FamilyMember[]>;
  rsvpHistory: Record<string, RSVPHistoryEntry[]>;
  costImpact: Record<string, { catering: number; rooms: number; transport: number; total: number }>;
  rsvpStats?: RSVPStats;
  eventId?: string;
  eventName?: string;
  eventDate?: string;
}

export function GuestsClient({
  families,
  individuals,
  logistics,
  familyMembers,
  rsvpHistory,
  costImpact,
  rsvpStats,
  eventId,
  eventName,
  eventDate,
}: Props) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('families');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showBulkRSVP, setShowBulkRSVP] = useState(false);

  const selectedFamily = families.find((f) => f.id === selectedFamilyId);
  const selectedMembers = selectedFamilyId ? (familyMembers[selectedFamilyId] || []) : [];
  const selectedRSVPHistory = selectedFamilyId ? (rsvpHistory[selectedFamilyId] || []) : [];
  const selectedCostImpact = selectedFamilyId ? (costImpact[selectedFamilyId] || { catering: 0, rooms: 0, transport: 0, total: 0 }) : { catering: 0, rooms: 0, transport: 0, total: 0 };

  // Find selected guest for the drawer
  const selectedGuest = selectedGuestId ? individuals.find((g) => g.id === selectedGuestId) : null;

  // Filter families based on filter mode
  const filteredFamilies = families.filter((family) => {
    if (filterMode === 'pending' && family.members_pending === 0) return false;
    if (filterMode === 'outstation' && !family.is_outstation) return false;
    if (filterMode === 'vip' && !family.is_vip) return false;
    if (filterMode === 'no-hotel' && family.rooms_allocated >= family.rooms_required) return false;
    if (filterMode === 'no-pickup' && (family.pickup_assigned || !family.pickup_required)) return false;

    if (searchQuery) {
      return family.family_name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Filter individuals
  const filteredIndividuals = individuals.filter((guest) => {
    if (searchQuery) {
      return guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             guest.family_name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600 mt-1">
            Family-aware tracking • RSVP management • Logistics coordination
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkRSVP(true)}
            className="px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 flex items-center gap-2 transition-all"
          >
            <Send className="h-5 w-5" />
            Send RSVP Reminders
          </button>
          <button
            onClick={() => setShowCSVImport(true)}
            className="px-4 py-2 rounded-lg border-2 border-rose-700 text-rose-700 font-semibold hover:bg-rose-50 flex items-center gap-2 transition-all"
          >
            <Upload className="h-5 w-5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddFamily(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-semibold hover:from-rose-800 hover:to-rose-950 flex items-center gap-2 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Family
          </button>
        </div>
      </div>

      {/* RSVP Statistics */}
      {rsvpStats && (
        <RSVPStatsCards stats={rsvpStats} />
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setViewMode('families')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'families'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4" />
          Families
        </button>
        <button
          onClick={() => setViewMode('individuals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'individuals'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <List className="h-4 w-4" />
          Individuals
        </button>
        <button
          onClick={() => setViewMode('logistics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'logistics'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Truck className="h-4 w-4" />
          Logistics
        </button>
      </div>

      {/* Search & Filters (Families and Individuals views only) */}
      {viewMode !== 'logistics' && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${viewMode === 'families' ? 'families' : 'guests'}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-rose-300 hover:bg-rose-50 flex items-center gap-2 font-semibold transition-all"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      )}

      {/* Filter Pills */}
      {showFilters && viewMode === 'families' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-rose-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Families
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterMode === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending RSVP
          </button>
          <button
            onClick={() => setFilterMode('outstation')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterMode === 'outstation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Outstation
          </button>
          <button
            onClick={() => setFilterMode('vip')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterMode === 'vip'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            VIP
          </button>
          <button
            onClick={() => setFilterMode('no-hotel')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterMode === 'no-hotel'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No Hotel
          </button>
          <button
            onClick={() => setFilterMode('no-pickup')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterMode === 'no-pickup'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No Pickup
          </button>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'families' && (
        <div className="space-y-4">
          {filteredFamilies.length === 0 ? (
            <div className="rounded-xl border-2 border-gray-200 bg-white p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No families yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first family to track RSVPs and logistics
              </p>
              <button
                onClick={() => setShowAddFamily(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all"
              >
                <Plus className="h-5 w-5" />
                Add First Family
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFamilies.map((family) => (
                <FamilyCard
                  key={family.id}
                  family={family}
                  onClick={() => setSelectedFamilyId(family.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'individuals' && (
        <IndividualsView
          guests={filteredIndividuals}
          onGuestClick={(guestId) => {
            // Open the guest detail drawer for RSVP updates
            setSelectedGuestId(guestId);
          }}
        />
      )}

      {viewMode === 'logistics' && (
        <LogisticsView
          hotelAssignments={logistics.hotelAssignments}
          pickupAssignments={logistics.pickupAssignments}
          guestsNeedingHotel={logistics.guestsNeedingHotel}
          guestsNeedingPickup={logistics.guestsNeedingPickup}
          guestTravelDetails={logistics.guestTravelDetails}
          onFamilyClick={(familyId) => {
            setViewMode('families');
            setSelectedFamilyId(familyId);
          }}
        />
      )}

      {/* Family Detail Drawer */}
      {selectedFamily && eventId && (
        <FamilyDetailDrawer
          family={selectedFamily}
          members={selectedMembers}
          rsvpHistory={selectedRSVPHistory}
          costImpact={selectedCostImpact}
          eventId={eventId}
          eventName={eventName}
          eventDate={eventDate}
          onClose={() => setSelectedFamilyId(null)}
        />
      )}

      {/* Guest Detail Drawer (for individual guest RSVP) */}
      {selectedGuest && eventId && (
        <GuestDetailDrawer
          guest={{
            id: selectedGuest.id,
            name: selectedGuest.name,
            family_name: selectedGuest.family_name,
            family_side: selectedGuest.family_side,
            rsvp_status: selectedGuest.rsvp_status,
            is_outstation: selectedGuest.is_outstation,
            hotel_assigned: selectedGuest.hotel_assigned,
            pickup_assigned: selectedGuest.pickup_assigned,
            is_vip: selectedGuest.is_vip,
            is_elderly: selectedGuest.is_elderly,
            is_child: selectedGuest.is_child,
            phone: selectedGuest.phone,
          }}
          eventId={eventId}
          onClose={() => setSelectedGuestId(null)}
        />
      )}

      {/* CSV Import Modal */}
      {showCSVImport && eventId && (
        <CSVImportModal
          eventId={eventId}
          onClose={() => setShowCSVImport(false)}
          onSuccess={() => {
            setShowCSVImport(false);
            router.refresh();
          }}
        />
      )}

      {/* Add Family Modal */}
      {showAddFamily && eventId && (
        <AddFamilyModal
          eventId={eventId}
          onClose={() => setShowAddFamily(false)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}

      {/* Bulk RSVP Actions Modal */}
      {showBulkRSVP && eventId && (
        <BulkRSVPActions
          families={families.map(f => ({
            id: f.id,
            family_name: f.family_name,
            primary_contact_phone: f.primary_contact_phone,
            members_pending: f.members_pending,
          }))}
          eventId={eventId}
          eventName={eventName || 'Wedding Celebration'}
          eventDate={eventDate}
          onClose={() => setShowBulkRSVP(false)}
        />
      )}
    </div>
  );
}
