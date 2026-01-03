'use client';

import { useState, useTransition } from 'react';
import {
  Phone,
  Plus,
  AlertTriangle,
  Heart,
  Car,
  Stethoscope,
  Shield,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  X,
  User,
  Star,
  Building2,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  category: 'medical' | 'security' | 'family' | 'vendor' | 'emergency_services' | 'transport' | 'other';
  isPrimary?: boolean;
  notes?: string;
  available24x7?: boolean;
}

interface EmergencyContactsProps {
  eventId: string;
  contacts: EmergencyContact[];
  onAdd?: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  onUpdate?: (id: string, contact: Partial<EmergencyContact>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  venueName?: string;
  venueAddress?: string;
}

const CATEGORY_CONFIG = {
  medical: {
    label: 'Medical',
    icon: Stethoscope,
    color: 'red',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
  },
  security: {
    label: 'Security',
    icon: Shield,
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  family: {
    label: 'Family Point of Contact',
    icon: Heart,
    color: 'rose',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
  },
  vendor: {
    label: 'Key Vendor',
    icon: Building2,
    color: 'purple',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
  },
  emergency_services: {
    label: 'Emergency Services',
    icon: Flame,
    color: 'orange',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
  },
  transport: {
    label: 'Transportation',
    icon: Car,
    color: 'green',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
  },
  other: {
    label: 'Other',
    icon: User,
    color: 'gray',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200',
  },
};

const ROLE_SUGGESTIONS = {
  medical: ['Doctor on Call', 'Nearest Hospital', 'Ambulance', 'First Aid Coordinator', 'Pharmacy'],
  security: ['Venue Security Head', 'Personal Security', 'Local Police Station', 'Parking Security'],
  family: ["Bride's Family Coordinator", "Groom's Family Coordinator", 'Wedding Planner', 'Point Person - Bride Side', 'Point Person - Groom Side'],
  vendor: ['Caterer', 'Decorator', 'Photographer', 'DJ/Entertainment', 'Makeup Artist', 'Pandit Ji'],
  emergency_services: ['Fire Station', 'Police Emergency', 'Ambulance Emergency', 'Control Room'],
  transport: ['Driver - Bride Car', 'Driver - Groom Car', 'Guest Transport Coordinator', 'Valet Service'],
  other: ['Hotel Concierge', 'Electrician', 'Generator Backup', 'AC Technician'],
};

export function EmergencyContacts({
  eventId,
  contacts,
  onAdd,
  onUpdate,
  onDelete,
  venueName,
  venueAddress,
}: EmergencyContactsProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORY_CONFIG>('family');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    category: 'family' as keyof typeof CATEGORY_CONFIG,
    isPrimary: false,
    notes: '',
    available24x7: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      role: '',
      category: 'family',
      isPrimary: false,
      notes: '',
      available24x7: false,
    });
    setEditingContact(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.role) return;

    startTransition(async () => {
      if (editingContact) {
        await onUpdate?.(editingContact.id, formData);
      } else {
        await onAdd?.(formData);
      }
      setShowAddModal(false);
      resetForm();
    });
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      role: contact.role,
      category: contact.category,
      isPrimary: contact.isPrimary || false,
      notes: contact.notes || '',
      available24x7: contact.available24x7 || false,
    });
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;
    startTransition(async () => {
      await onDelete?.(id);
    });
  };

  // Group contacts by category
  const groupedContacts = contacts.reduce((acc, contact) => {
    const cat = contact.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(contact);
    return acc;
  }, {} as Record<string, EmergencyContact[]>);

  // Primary contacts for quick access
  const primaryContacts = contacts.filter(c => c.isPrimary);

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Emergency Contacts</h2>
              <p className="text-white/80 text-sm mt-1">
                Quick access to important contacts on your wedding day
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {/* Venue Info */}
        {(venueName || venueAddress) && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-white/80" />
              <div>
                {venueName && <p className="font-medium">{venueName}</p>}
                {venueAddress && <p className="text-sm text-white/80">{venueAddress}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Contacts - Quick Dial */}
      {primaryContacts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
            Primary Contacts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {primaryContacts.map(contact => {
              const config = CATEGORY_CONFIG[contact.category];
              const Icon = config.icon;

              return (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-100 hover:border-amber-300 transition-colors"
                >
                  <div className={cn("p-2 rounded-lg", config.bgClass)}>
                    <Icon className={cn("h-4 w-4", config.textClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Phone className="h-4 w-4" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Emergency Numbers */}
      <div className="grid grid-cols-3 gap-3">
        <a
          href="tel:100"
          className="flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Police</span>
          <span className="text-lg font-bold text-blue-700">100</span>
        </a>
        <a
          href="tel:102"
          className="flex flex-col items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
        >
          <Stethoscope className="h-6 w-6 text-red-600" />
          <span className="text-sm font-medium text-red-900">Ambulance</span>
          <span className="text-lg font-bold text-red-700">102</span>
        </a>
        <a
          href="tel:101"
          className="flex flex-col items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <Flame className="h-6 w-6 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">Fire</span>
          <span className="text-lg font-bold text-orange-700">101</span>
        </a>
      </div>

      {/* Contacts by Category */}
      <div className="space-y-4">
        {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
          const categoryContacts = groupedContacts[category] || [];
          if (categoryContacts.length === 0) return null;

          const Icon = config.icon;

          return (
            <div key={category} className="bg-white rounded-xl border">
              <div className={cn("p-4 border-b flex items-center gap-3", config.bgClass)}>
                <Icon className={cn("h-5 w-5", config.textClass)} />
                <h3 className={cn("font-semibold", config.textClass)}>{config.label}</h3>
                <span className="ml-auto bg-white/80 px-2 py-0.5 rounded-full text-sm font-medium text-gray-600">
                  {categoryContacts.length}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {categoryContacts.map(contact => (
                  <div key={contact.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        {contact.isPrimary && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                        {contact.available24x7 && (
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            24/7
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{contact.role}</p>
                      {contact.notes && (
                        <p className="text-xs text-gray-400 mt-1">{contact.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-medium">{contact.phone}</span>
                      </a>
                      {onUpdate && (
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <Phone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">No contacts added yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Add important contacts for quick access during your event
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            Add First Contact
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add important contacts for your wedding day
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, category: key as any }))}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                          formData.category === key
                            ? cn(config.bgClass, config.borderClass)
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4",
                          formData.category === key ? config.textClass : "text-gray-400"
                        )} />
                        <span className="text-xs font-medium text-center">
                          {config.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g., Dr. Sharma, City Hospital"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role / Title *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(f => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g., Doctor on Call, Wedding Planner"
                  list="role-suggestions"
                  required
                />
                <datalist id="role-suggestions">
                  {ROLE_SUGGESTIONS[formData.category]?.map(role => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              {/* Options */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData(f => ({ ...f, isPrimary: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-700">Primary Contact</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available24x7}
                    onChange={(e) => setFormData(f => ({ ...f, available24x7: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Available 24/7</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Any additional details..."
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
