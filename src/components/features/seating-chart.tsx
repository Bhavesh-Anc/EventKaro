'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  ChevronDown,
  UserPlus,
  Table2,
  GripVertical,
  Check,
} from 'lucide-react';

export interface TableConfig {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular' | 'oval';
  category: 'vip' | 'family' | 'friends' | 'general';
}

export interface GuestSeat {
  id: string;
  name: string;
  familyName: string;
  familySide: 'bride' | 'groom';
  tableId: string | null;
  seatNumber: number | null;
  dietaryRestrictions?: string[];
  isVip?: boolean;
  isElderly?: boolean;
  isChild?: boolean;
}

interface Props {
  tables: TableConfig[];
  guests: GuestSeat[];
  onAssignGuest: (guestId: string, tableId: string, seatNumber: number) => void;
  onRemoveGuest: (guestId: string) => void;
  onAddTable: (table: Omit<TableConfig, 'id'>) => void;
  onEditTable: (tableId: string, updates: Partial<TableConfig>) => void;
  onDeleteTable: (tableId: string) => void;
}

const TABLE_SHAPES = [
  { value: 'round', label: 'Round', icon: '⭕' },
  { value: 'rectangular', label: 'Rectangular', icon: '▭' },
  { value: 'oval', label: 'Oval', icon: '⬭' },
];

const TABLE_CATEGORIES = [
  { value: 'vip', label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'family', label: 'Family', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { value: 'friends', label: 'Friends', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

export function SeatingChart({
  tables,
  guests,
  onAssignGuest,
  onRemoveGuest,
  onAddTable,
  onEditTable,
  onDeleteTable,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null);
  const [filterSide, setFilterSide] = useState<'all' | 'bride' | 'groom'>('all');

  // New table form state
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 8,
    shape: 'round' as const,
    category: 'general' as const,
  });

  // Get unassigned guests
  const unassignedGuests = guests.filter((g) => !g.tableId);

  // Filter guests by search and side
  const filteredUnassigned = unassignedGuests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.familyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide = filterSide === 'all' || guest.familySide === filterSide;
    return matchesSearch && matchesSide;
  });

  // Get guests assigned to a table
  const getTableGuests = (tableId: string) =>
    guests.filter((g) => g.tableId === tableId).sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));

  // Get category color
  const getCategoryColor = (category: string) =>
    TABLE_CATEGORIES.find((c) => c.value === category)?.color || TABLE_CATEGORIES[3].color;

  // Handle drag start
  const handleDragStart = (guestId: string) => {
    setDraggedGuest(guestId);
  };

  // Handle drop on table
  const handleDrop = (tableId: string) => {
    if (draggedGuest) {
      const table = tables.find((t) => t.id === tableId);
      const currentOccupancy = getTableGuests(tableId).length;

      if (table && currentOccupancy < table.capacity) {
        onAssignGuest(draggedGuest, tableId, currentOccupancy + 1);
      }
    }
    setDraggedGuest(null);
  };

  // Handle add table
  const handleAddTable = () => {
    if (newTable.name) {
      onAddTable(newTable);
      setNewTable({
        name: '',
        capacity: 8,
        shape: 'round',
        category: 'general',
      });
      setShowAddTable(false);
    }
  };

  // Calculate stats
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const assignedCount = guests.filter((g) => g.tableId).length;
  const occupancyRate = totalSeats > 0 ? Math.round((assignedCount / totalSeats) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Table2 className="h-5 w-5 text-rose-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tables</p>
              <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Seats</p>
              <p className="text-2xl font-bold text-gray-900">{totalSeats}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Seated</p>
              <p className="text-2xl font-bold text-gray-900">{assignedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">{unassignedGuests.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unassigned Guests Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-900">Unassigned Guests</h3>
            <p className="text-sm text-gray-600">{filteredUnassigned.length} guests to seat</p>
          </div>

          {/* Search & Filter */}
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'bride', 'groom'] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => setFilterSide(side)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filterSide === side
                      ? 'bg-rose-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {side === 'all' ? 'All' : side === 'bride' ? "Bride's" : "Groom's"}
                </button>
              ))}
            </div>
          </div>

          {/* Guest List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
            {filteredUnassigned.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No unassigned guests</p>
              </div>
            ) : (
              filteredUnassigned.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => handleDragStart(guest.id)}
                  onDragEnd={() => setDraggedGuest(null)}
                  className={`p-3 flex items-center gap-3 cursor-grab hover:bg-gray-50 transition-colors ${
                    draggedGuest === guest.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{guest.name}</p>
                      {guest.isVip && (
                        <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">VIP</span>
                      )}
                      {guest.isElderly && (
                        <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Elderly</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {guest.familyName} • {guest.familySide === 'bride' ? "Bride's side" : "Groom's side"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tables Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Table Button */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Seating Tables</h3>
            <button
              onClick={() => setShowAddTable(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </button>
          </div>

          {/* Tables */}
          {tables.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <Table2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">No tables yet</h4>
              <p className="text-gray-600 mb-4">Add tables to start arranging your seating</p>
              <button
                onClick={() => setShowAddTable(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800"
              >
                <Plus className="h-4 w-4" />
                Add First Table
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tables.map((table) => {
                const tableGuests = getTableGuests(table.id);
                const isFull = tableGuests.length >= table.capacity;
                const isSelected = selectedTable === table.id;

                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(isSelected ? null : table.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(table.id)}
                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 shadow-lg'
                        : draggedGuest && !isFull
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Table Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{table.name}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getCategoryColor(table.category)}`}>
                            {TABLE_CATEGORIES.find((c) => c.value === table.category)?.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {TABLE_SHAPES.find((s) => s.value === table.shape)?.icon} {table.shape} •{' '}
                          {tableGuests.length}/{table.capacity} seats
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTable(table.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all ${
                          isFull ? 'bg-green-500' : tableGuests.length > 0 ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${(tableGuests.length / table.capacity) * 100}%` }}
                      />
                    </div>

                    {/* Seated Guests Preview */}
                    {tableGuests.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tableGuests.slice(0, 6).map((guest) => (
                          <div
                            key={guest.id}
                            className="group relative px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700"
                          >
                            {guest.name.split(' ')[0]}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveGuest(guest.id);
                              }}
                              className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center bg-red-500 text-white rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {tableGuests.length > 6 && (
                          <span className="px-2 py-1 text-xs text-gray-500">+{tableGuests.length - 6} more</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Drag guests here to assign</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Add New Table</h3>
              <button onClick={() => setShowAddTable(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="e.g., Table 1, VIP Table, Family Table"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 8 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                <div className="flex gap-2">
                  {TABLE_SHAPES.map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => setNewTable({ ...newTable, shape: shape.value as any })}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-center transition-all ${
                        newTable.shape === shape.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{shape.icon}</span>
                      <span className="block text-xs mt-1">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {TABLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setNewTable({ ...newTable, category: cat.value as any })}
                      className={`py-2 px-3 rounded-lg border-2 text-center transition-all ${
                        newTable.category === cat.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowAddTable(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTable}
                disabled={!newTable.name}
                className="flex-1 px-4 py-2 bg-rose-700 text-white rounded-lg font-medium hover:bg-rose-800 disabled:opacity-50"
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
