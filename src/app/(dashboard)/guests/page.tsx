'use client';

import { useState, useEffect } from 'react';
import { Users, List, Truck, Plus, Filter, Search } from 'lucide-react';
import { FamilyCard, type FamilyCardData } from '@/components/features/family-card';
import { FamilyDetailDrawer, type FamilyMember, type RSVPHistoryEntry } from '@/components/features/family-detail-drawer';
import { IndividualsView, type IndividualGuest } from '@/components/features/individuals-view';
import { LogisticsView, type LogisticsGuest, type HotelAssignment, type PickupAssignment } from '@/components/features/logistics-view';

type ViewMode = 'families' | 'individuals' | 'logistics';
type FilterMode = 'all' | 'pending' | 'outstation' | 'vip' | 'no-hotel' | 'no-pickup';

export default function GuestsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('families');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // TODO: Fetch real data from Supabase
  // For now, using placeholder data structure
  const mockFamilies: FamilyCardData[] = [];
  const mockIndividuals: IndividualGuest[] = [];
  const mockLogistics = {
    hotelAssignments: [] as HotelAssignment[],
    pickupAssignments: [] as PickupAssignment[],
    guestsNeedingHotel: [] as LogisticsGuest[],
    guestsNeedingPickup: [] as LogisticsGuest[],
  };

  const selectedFamily = mockFamilies.find((f) => f.id === selectedFamilyId);
  const mockMembers: FamilyMember[] = [];
  const mockRSVPHistory: RSVPHistoryEntry[] = [];
  const mockCostImpact = {
    catering: 0,
    rooms: 0,
    transport: 0,
    total: 0,
  };

  // Filter families based on filter mode
  const filteredFamilies = mockFamilies.filter((family) => {
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
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-semibold hover:from-rose-800 hover:to-rose-950 flex items-center gap-2 transition-all">
          <Plus className="h-5 w-5" />
          Add Family
        </button>
      </div>

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
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-900 text-white rounded-lg hover:from-rose-800 hover:to-rose-950 font-semibold transition-all">
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
          guests={mockIndividuals}
          onGuestClick={(guestId) => {
            // Find the family for this guest and open the drawer
            console.log('Guest clicked:', guestId);
          }}
        />
      )}

      {viewMode === 'logistics' && (
        <LogisticsView
          hotelAssignments={mockLogistics.hotelAssignments}
          pickupAssignments={mockLogistics.pickupAssignments}
          guestsNeedingHotel={mockLogistics.guestsNeedingHotel}
          guestsNeedingPickup={mockLogistics.guestsNeedingPickup}
          onFamilyClick={(familyId) => {
            setViewMode('families');
            setSelectedFamilyId(familyId);
          }}
        />
      )}

      {/* Family Detail Drawer */}
      {selectedFamily && (
        <FamilyDetailDrawer
          family={selectedFamily}
          members={mockMembers}
          rsvpHistory={mockRSVPHistory}
          costImpact={mockCostImpact}
          onClose={() => setSelectedFamilyId(null)}
        />
      )}
    </div>
  );
}
