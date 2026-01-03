'use client';

import { useState, useMemo } from 'react';
import { format, differenceInMinutes, addMinutes, isBefore, isAfter, parseISO } from 'date-fns';
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Users,
  Camera,
  Music,
  Utensils,
  Heart,
  Sparkles,
  Plus,
  Edit2,
  X,
  Timer,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RunsheetItem {
  id: string;
  time: string; // HH:mm format
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  assignedTo?: string[];
  category: 'ceremony' | 'ritual' | 'photo' | 'food' | 'entertainment' | 'logistics' | 'transition' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  notes?: string;
  isImportant?: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  delayMinutes?: number;
}

interface EventDayRunsheetProps {
  eventDate: string;
  eventName: string;
  items: RunsheetItem[];
  onStatusChange?: (id: string, status: RunsheetItem['status']) => Promise<void>;
  onItemUpdate?: (id: string, updates: Partial<RunsheetItem>) => Promise<void>;
  onAddItem?: (item: Omit<RunsheetItem, 'id'>) => Promise<void>;
  isLiveMode?: boolean;
}

const CATEGORY_CONFIG = {
  ceremony: {
    label: 'Ceremony',
    icon: Heart,
    color: 'rose',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-300',
    dotClass: 'bg-rose-500',
  },
  ritual: {
    label: 'Ritual',
    icon: Sparkles,
    color: 'amber',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    dotClass: 'bg-amber-500',
  },
  photo: {
    label: 'Photography',
    icon: Camera,
    color: 'purple',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300',
    dotClass: 'bg-purple-500',
  },
  food: {
    label: 'Food & Drinks',
    icon: Utensils,
    color: 'green',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
    dotClass: 'bg-green-500',
  },
  entertainment: {
    label: 'Entertainment',
    icon: Music,
    color: 'blue',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    dotClass: 'bg-blue-500',
  },
  logistics: {
    label: 'Logistics',
    icon: Users,
    color: 'gray',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
    dotClass: 'bg-gray-500',
  },
  transition: {
    label: 'Transition',
    icon: Clock,
    color: 'indigo',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-300',
    dotClass: 'bg-indigo-500',
  },
  other: {
    label: 'Other',
    icon: Clock,
    color: 'slate',
    bgClass: 'bg-slate-50',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300',
    dotClass: 'bg-slate-500',
  },
};

const STATUS_CONFIG = {
  pending: { label: 'Upcoming', color: 'gray', icon: Clock },
  in_progress: { label: 'In Progress', color: 'blue', icon: Play },
  completed: { label: 'Done', color: 'green', icon: CheckCircle2 },
  delayed: { label: 'Delayed', color: 'amber', icon: AlertCircle },
  skipped: { label: 'Skipped', color: 'red', icon: X },
};

export function EventDayRunsheet({
  eventDate,
  eventName,
  items,
  onStatusChange,
  onItemUpdate,
  onAddItem,
  isLiveMode = false,
}: EventDayRunsheetProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Form state
  const [formData, setFormData] = useState({
    time: '',
    endTime: '',
    title: '',
    description: '',
    location: '',
    category: 'other' as keyof typeof CATEGORY_CONFIG,
    assignedTo: '',
    isImportant: false,
  });

  // Sort items by time
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.time.localeCompare(b.time));
  }, [items]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    const delayed = items.filter(i => i.status === 'delayed').length;
    const pending = items.filter(i => i.status === 'pending').length;

    // Calculate total delay
    const totalDelay = items.reduce((sum, item) => sum + (item.delayMinutes || 0), 0);

    return { total, completed, inProgress, delayed, pending, totalDelay };
  }, [items]);

  // Find current/next item based on time
  const currentItem = useMemo(() => {
    if (!isLiveMode) return null;
    const now = format(currentTime, 'HH:mm');
    return sortedItems.find(item =>
      item.status === 'in_progress' ||
      (item.status === 'pending' && item.time <= now)
    );
  }, [sortedItems, currentTime, isLiveMode]);

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return null;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = endMinutes - startMinutes;

    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.time || !formData.title) return;

    await onAddItem?.({
      time: formData.time,
      endTime: formData.endTime || undefined,
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location || undefined,
      category: formData.category,
      assignedTo: formData.assignedTo ? formData.assignedTo.split(',').map(s => s.trim()) : undefined,
      isImportant: formData.isImportant,
      status: 'pending',
    });

    setShowAddModal(false);
    setFormData({
      time: '',
      endTime: '',
      title: '',
      description: '',
      location: '',
      category: 'other',
      assignedTo: '',
      isImportant: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">
              {format(parseISO(eventDate), 'EEEE, d MMMM yyyy')}
            </p>
            <h2 className="text-2xl font-bold">{eventName}</h2>
            <p className="text-white/80 mt-1">Day Schedule / Run Sheet</p>
          </div>
          <div className="text-right">
            {isLiveMode && (
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <p className="text-xs text-white/80">Current Time</p>
                <p className="text-2xl font-mono font-bold">
                  {format(currentTime, 'HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="mt-6 grid grid-cols-5 gap-3">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-white/80">Total</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold text-green-300">{stats.completed}</p>
            <p className="text-xs text-white/80">Done</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold text-blue-300">{stats.inProgress}</p>
            <p className="text-xs text-white/80">Active</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold text-amber-300">{stats.delayed}</p>
            <p className="text-xs text-white/80">Delayed</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-white/80">Pending</p>
          </div>
        </div>

        {/* Delay Warning */}
        {stats.totalDelay > 0 && (
          <div className="mt-4 bg-amber-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span className="text-sm">
              Running <span className="font-bold">{stats.totalDelay} minutes</span> behind schedule
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === 'timeline'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === 'list'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            List
          </button>
        </div>

        {onAddItem && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        )}
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {sortedItems.map((item, index) => {
              const config = CATEGORY_CONFIG[item.category];
              const Icon = config.icon;
              const statusConfig = STATUS_CONFIG[item.status];
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedItem === item.id;
              const duration = formatDuration(item.time, item.endTime);
              const isCurrent = currentItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative flex gap-4 transition-all",
                    isCurrent && "scale-[1.02]"
                  )}
                >
                  {/* Time */}
                  <div className="w-16 text-right flex-shrink-0">
                    <p className={cn(
                      "font-mono font-bold text-lg",
                      item.status === 'completed' ? "text-gray-400" : "text-gray-900"
                    )}>
                      {item.time}
                    </p>
                    {duration && (
                      <p className="text-xs text-gray-500">{duration}</p>
                    )}
                  </div>

                  {/* Timeline Dot */}
                  <div className={cn(
                    "relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0 mt-1.5",
                    item.status === 'completed' ? "bg-green-500" :
                    item.status === 'in_progress' ? "bg-blue-500 animate-pulse" :
                    item.status === 'delayed' ? "bg-amber-500" :
                    config.dotClass
                  )} />

                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 rounded-xl border-2 transition-all",
                    isCurrent ? "border-blue-400 shadow-lg" :
                    item.status === 'completed' ? "border-green-200 bg-green-50/50" :
                    item.status === 'delayed' ? "border-amber-200 bg-amber-50/50" :
                    "border-gray-200 bg-white hover:border-gray-300"
                  )}>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Category Icon */}
                        <div className={cn("p-2 rounded-lg", config.bgClass)}>
                          <Icon className={cn("h-4 w-4", config.textClass)} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={cn(
                              "font-semibold",
                              item.status === 'completed' ? "text-gray-500 line-through" : "text-gray-900"
                            )}>
                              {item.title}
                            </h4>
                            {item.isImportant && (
                              <Bell className="h-4 w-4 text-amber-500" />
                            )}
                            <span className={cn(
                              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                              item.status === 'completed' ? "bg-green-100 text-green-700" :
                              item.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                              item.status === 'delayed' ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {item.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </span>
                            )}
                            {item.assignedTo && item.assignedTo.length > 0 && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.assignedTo.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {onStatusChange && (
                          <div className="flex items-center gap-1">
                            {item.status !== 'completed' && (
                              <>
                                {item.status !== 'in_progress' && (
                                  <button
                                    onClick={() => onStatusChange(item.id, 'in_progress')}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Start"
                                  >
                                    <Play className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onStatusChange(item.id, 'completed')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Complete"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Delay Info */}
                      {item.delayMinutes && item.delayMinutes > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
                          <Timer className="h-4 w-4" />
                          <span>Delayed by {item.delayMinutes} minutes</span>
                        </div>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          {item.notes && (
                            <div>
                              <p className="text-xs text-gray-500">Notes</p>
                              <p className="text-sm text-gray-700">{item.notes}</p>
                            </div>
                          )}
                          {item.actualStartTime && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Actual Start</p>
                                <p className="font-medium">{item.actualStartTime}</p>
                              </div>
                              {item.actualEndTime && (
                                <div>
                                  <p className="text-gray-500">Actual End</p>
                                  <p className="font-medium">{item.actualEndTime}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quick Status Buttons */}
                          {onStatusChange && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => onStatusChange(item.id, 'delayed')}
                                className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                              >
                                Mark Delayed
                              </button>
                              <button
                                onClick={() => onStatusChange(item.id, 'skipped')}
                                className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              >
                                Skip
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Time</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Activity</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Assigned</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedItems.map(item => {
                const config = CATEGORY_CONFIG[item.category];
                const statusConfig = STATUS_CONFIG[item.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={item.id} className={cn(
                    "hover:bg-gray-50 transition-colors",
                    item.status === 'completed' && "bg-green-50/50"
                  )}>
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold">{item.time}</p>
                      {item.endTime && (
                        <p className="text-xs text-gray-500">to {item.endTime}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          item.status === 'completed' && "line-through text-gray-500"
                        )}>
                          {item.title}
                        </span>
                        {item.isImportant && (
                          <Bell className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.location || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.assignedTo?.join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        item.status === 'completed' ? "bg-green-100 text-green-700" :
                        item.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                        item.status === 'delayed' ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {onStatusChange && item.status !== 'completed' && (
                        <button
                          onClick={() => onStatusChange(item.id, 'completed')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">No schedule items yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Create your event day run sheet
          </p>
          {onAddItem && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add First Item
            </button>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Add Schedule Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(f => ({ ...f, time: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g., Bride Getting Ready, Baraat Arrival"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
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
                          "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                          formData.category === key
                            ? cn(config.bgClass, config.borderClass)
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4",
                          formData.category === key ? config.textClass : "text-gray-400"
                        )} />
                        <span className="text-xs">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g., Main Hall, Lawn Area"
                />
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g., Photographer, Caterer (comma separated)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Additional details..."
                />
              </div>

              {/* Important */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData(f => ({ ...f, isImportant: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Bell className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-700">Mark as important</span>
              </label>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
