'use client';

import { useState, useTransition } from 'react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import {
  Bell,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Plus,
  Calendar,
  Users,
  CreditCard,
  CheckSquare,
  Plane,
  AlertTriangle,
  Check,
  X,
  Trash2,
  Edit2,
  Play,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  type: 'rsvp_deadline' | 'payment_due' | 'task_deadline' | 'event_countdown' | 'vendor_followup' | 'guest_travel' | 'custom';
  title: string;
  message: string;
  scheduled_for: string;
  send_via: ('email' | 'whatsapp' | 'sms' | 'push')[];
  recipients: 'all_guests' | 'pending_rsvp' | 'confirmed_guests' | 'team' | 'specific';
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
}

interface ReminderStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
  cancelled: number;
  byType: Record<string, number>;
}

interface Props {
  eventId: string;
  eventName: string;
  eventDate: string;
  reminders: Reminder[];
  upcomingReminders: Reminder[];
  stats: ReminderStats;
  onCreateReminder: (data: Partial<Reminder>) => Promise<void>;
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
  onSendNow: (id: string) => Promise<void>;
  onCancelReminder: (id: string) => Promise<void>;
  onCreateCountdownReminders: () => Promise<void>;
}

const TYPE_CONFIG = {
  rsvp_deadline: { label: 'RSVP Reminder', icon: Users, color: 'blue' },
  payment_due: { label: 'Payment Due', icon: CreditCard, color: 'amber' },
  task_deadline: { label: 'Task Deadline', icon: CheckSquare, color: 'purple' },
  event_countdown: { label: 'Event Countdown', icon: Calendar, color: 'rose' },
  vendor_followup: { label: 'Vendor Follow-up', icon: MessageSquare, color: 'green' },
  guest_travel: { label: 'Travel Reminder', icon: Plane, color: 'indigo' },
  custom: { label: 'Custom', icon: Bell, color: 'gray' },
};

const CHANNEL_CONFIG = {
  email: { icon: Mail, label: 'Email' },
  whatsapp: { icon: MessageSquare, label: 'WhatsApp' },
  sms: { icon: Smartphone, label: 'SMS' },
  push: { icon: Bell, label: 'Push' },
};

const RECIPIENT_OPTIONS = [
  { value: 'all_guests', label: 'All Guests' },
  { value: 'pending_rsvp', label: 'Pending RSVP' },
  { value: 'confirmed_guests', label: 'Confirmed Guests' },
  { value: 'team', label: 'Team Members' },
];

export function ReminderDashboard({
  eventId,
  eventName,
  eventDate,
  reminders,
  upcomingReminders,
  stats,
  onCreateReminder,
  onUpdateReminder,
  onDeleteReminder,
  onSendNow,
  onCancelReminder,
  onCreateCountdownReminders,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    type: 'custom' as Reminder['type'],
    title: '',
    message: '',
    scheduled_for: '',
    send_via: ['email'] as ('email' | 'whatsapp' | 'sms' | 'push')[],
    recipients: 'all_guests' as Reminder['recipients'],
  });

  const resetForm = () => {
    setFormData({
      type: 'custom',
      title: '',
      message: '',
      scheduled_for: '',
      send_via: ['email'],
      recipients: 'all_guests',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await onCreateReminder(formData);
      setShowCreateModal(false);
      resetForm();
    });
  };

  const toggleChannel = (channel: 'email' | 'whatsapp' | 'sms' | 'push') => {
    setFormData(prev => ({
      ...prev,
      send_via: prev.send_via.includes(channel)
        ? prev.send_via.filter(c => c !== channel)
        : [...prev.send_via, channel],
    }));
  };

  // Calculate days until event
  const daysToEvent = Math.ceil(
    (new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const filteredReminders = reminders.filter(r => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getScheduleLabel = (date: string) => {
    const d = new Date(date);
    if (isPast(d)) return 'Overdue';
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return formatDistanceToNow(d, { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Reminders & Notifications</h2>
            <p className="text-white/80">{eventName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => startTransition(() => onCreateCountdownReminders())}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Auto-Create Countdown
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Reminder
            </button>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-6 bg-white/10 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="h-8 w-8" />
            <div>
              <p className="text-white/80 text-sm">Days until {eventName}</p>
              <p className="text-3xl font-bold">{daysToEvent} days</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Event Date</p>
            <p className="font-semibold">{format(new Date(eventDate), 'd MMMM yyyy')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold">{stats.scheduled}</p>
            <p className="text-sm text-white/80">Scheduled</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-300">{stats.sent}</p>
            <p className="text-sm text-white/80">Sent</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-red-300">{stats.failed}</p>
            <p className="text-sm text-white/80">Failed</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold">{upcomingReminders.length}</p>
            <p className="text-sm text-white/80">This Week</p>
          </div>
        </div>
      </div>

      {/* Upcoming Reminders Alert */}
      {upcomingReminders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Upcoming This Week
          </h3>
          <div className="space-y-2">
            {upcomingReminders.slice(0, 3).map(reminder => {
              const config = TYPE_CONFIG[reminder.type];
              const Icon = config.icon;
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", `bg-${config.color}-100`)}>
                      <Icon className={cn("h-4 w-4", `text-${config.color}-600`)} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(reminder.scheduled_for), 'd MMM, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startTransition(() => onSendNow(reminder.id))}
                    disabled={isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Play className="h-4 w-4" />
                    Send Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Reminders List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredReminders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reminders found</p>
              <p className="text-sm mt-1">Create your first reminder to get started</p>
            </div>
          ) : (
            filteredReminders.map(reminder => {
              const config = TYPE_CONFIG[reminder.type];
              const Icon = config.icon;
              const isExpanded = expandedId === reminder.id;
              const scheduleLabel = getScheduleLabel(reminder.scheduled_for);
              const isOverdue = isPast(new Date(reminder.scheduled_for)) && reminder.status === 'scheduled';

              return (
                <div key={reminder.id}>
                  <div className={cn(
                    "p-4 flex items-center gap-4 hover:bg-gray-50",
                    isOverdue && "bg-red-50"
                  )}>
                    {/* Type Icon */}
                    <div className={cn("p-3 rounded-xl", `bg-${config.color}-100`)}>
                      <Icon className={cn("h-5 w-5", `text-${config.color}-600`)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate">{reminder.title}</h4>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{reminder.message}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scheduleLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          {reminder.send_via.map(channel => {
                            const ChannelIcon = CHANNEL_CONFIG[channel].icon;
                            return <ChannelIcon key={channel} className="h-3 w-3" />;
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        reminder.status === 'scheduled' && "bg-blue-100 text-blue-700",
                        reminder.status === 'sent' && "bg-green-100 text-green-700",
                        reminder.status === 'failed' && "bg-red-100 text-red-700",
                        reminder.status === 'cancelled' && "bg-gray-100 text-gray-600"
                      )}>
                        {reminder.status === 'scheduled' && <Clock className="h-3 w-3" />}
                        {reminder.status === 'sent' && <Check className="h-3 w-3" />}
                        {reminder.status === 'failed' && <X className="h-3 w-3" />}
                        {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {reminder.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => startTransition(() => onSendNow(reminder.id))}
                            disabled={isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Send Now"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => startTransition(() => onCancelReminder(reminder.id))}
                            disabled={isPending}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => startTransition(() => onDeleteReminder(reminder.id))}
                        disabled={isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : reminder.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Scheduled For</p>
                          <p className="font-medium">
                            {format(new Date(reminder.scheduled_for), 'd MMM yyyy, h:mm a')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Recipients</p>
                          <p className="font-medium">
                            {RECIPIENT_OPTIONS.find(r => r.value === reminder.recipients)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Channels</p>
                          <div className="flex gap-2 mt-1">
                            {reminder.send_via.map(channel => {
                              const config = CHANNEL_CONFIG[channel];
                              const ChannelIcon = config.icon;
                              return (
                                <span
                                  key={channel}
                                  className="flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded text-xs"
                                >
                                  <ChannelIcon className="h-3 w-3" />
                                  {config.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-gray-500 text-sm">Message</p>
                        <p className="text-sm text-gray-700 mt-1 bg-white rounded p-2 border">
                          {reminder.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create Reminder</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([value, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, type: value as any }))}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                          formData.type === value
                            ? `border-${config.color}-400 bg-${config.color}-50`
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", `text-${config.color}-600`)} />
                        <span className="text-xs text-center">{config.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(f => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  rows={3}
                  required
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_for}
                  onChange={(e) => setFormData(f => ({ ...f, scheduled_for: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <select
                  value={formData.recipients}
                  onChange={(e) => setFormData(f => ({ ...f, recipients: e.target.value as any }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {RECIPIENT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Via</label>
                <div className="flex gap-2">
                  {Object.entries(CHANNEL_CONFIG).map(([channel, config]) => {
                    const Icon = config.icon;
                    const isSelected = formData.send_via.includes(channel as any);
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel as any)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                          isSelected
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
