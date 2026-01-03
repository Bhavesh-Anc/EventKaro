'use client';

import { useState, useEffect, useTransition } from 'react';
import { format } from 'date-fns';
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  MessageSquare,
  MapPin,
  Users,
  ChevronRight,
  Menu,
  X,
  Bell,
  Timer,
  Zap,
  RefreshCw,
  Volume2,
  Camera,
  Utensils,
  Music,
  Heart,
  Sparkles,
  Car,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RunsheetItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  assignedTo?: string[];
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  delayMinutes?: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  category: string;
  isPrimary?: boolean;
}

interface Props {
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName?: string;
  runsheetItems: RunsheetItem[];
  emergencyContacts: EmergencyContact[];
  onStatusChange: (itemId: string, status: RunsheetItem['status']) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const CATEGORY_ICONS: Record<string, any> = {
  ceremony: Heart,
  ritual: Sparkles,
  photo: Camera,
  food: Utensils,
  entertainment: Music,
  logistics: Car,
  transition: Clock,
  other: Clock,
};

export function EventDayMode({
  eventId,
  eventName,
  eventDate,
  venueName,
  runsheetItems,
  emergencyContacts,
  onStatusChange,
  onRefresh,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showContacts, setShowContacts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sort items by time
  const sortedItems = [...runsheetItems].sort((a, b) => a.time.localeCompare(b.time));

  // Find current and next items
  const now = format(currentTime, 'HH:mm');
  const currentItem = sortedItems.find(
    item => item.status === 'in_progress' ||
    (item.status === 'pending' && item.time <= now && (!item.endTime || item.endTime > now))
  );
  const nextItems = sortedItems.filter(
    item => item.status === 'pending' && item.time > now
  ).slice(0, 3);

  // Calculate progress
  const completedCount = runsheetItems.filter(i => i.status === 'completed').length;
  const progress = runsheetItems.length > 0
    ? Math.round((completedCount / runsheetItems.length) * 100)
    : 0;

  // Total delay
  const totalDelay = runsheetItems.reduce((sum, item) => sum + (item.delayMinutes || 0), 0);

  // Primary contacts
  const primaryContacts = emergencyContacts.filter(c => c.isPrimary).slice(0, 4);

  const handleQuickAction = (itemId: string, action: 'start' | 'complete' | 'delay') => {
    const status = action === 'start' ? 'in_progress' : action === 'complete' ? 'completed' : 'delayed';
    startTransition(() => onStatusChange(itemId, status));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">{eventName}</h1>
              <p className="text-xs text-gray-400">{venueName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startTransition(() => onRefresh())}
              disabled={isPending}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <RefreshCw className={cn("h-5 w-5", isPending && "animate-spin")} />
            </button>
            <button
              onClick={() => setShowContacts(true)}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <Phone className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live Time Bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLiveMode && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            <span className="text-sm font-medium">
              {isLiveMode ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold">
            {format(currentTime, 'HH:mm')}
          </div>
          <div className="text-sm">
            {format(currentTime, 'EEE, d MMM')}
          </div>
        </div>
      </header>

      {/* Main Content - with header offset */}
      <main className="pt-28 pb-24 px-4 space-y-4">
        {/* Progress Card */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Event Progress</span>
            <span className="text-sm font-medium">{completedCount}/{runsheetItems.length}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {totalDelay > 0 && (
            <div className="flex items-center gap-2 mt-2 text-amber-400 text-sm">
              <Timer className="h-4 w-4" />
              Running {totalDelay} min behind
            </div>
          )}
        </div>

        {/* Current Item Card */}
        {currentItem && (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-200 text-sm font-medium">NOW</span>
              <span className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                {currentItem.time}
                {currentItem.endTime && ` - ${currentItem.endTime}`}
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2">{currentItem.title}</h2>

            {currentItem.description && (
              <p className="text-indigo-100 text-sm mb-3">{currentItem.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-indigo-200 mb-4">
              {currentItem.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {currentItem.location}
                </span>
              )}
              {currentItem.assignedTo && currentItem.assignedTo.length > 0 && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {currentItem.assignedTo.join(', ')}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              {currentItem.status === 'pending' && (
                <button
                  onClick={() => handleQuickAction(currentItem.id, 'start')}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium"
                >
                  <Play className="h-5 w-5" />
                  Start
                </button>
              )}
              <button
                onClick={() => handleQuickAction(currentItem.id, 'complete')}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-medium"
              >
                <CheckCircle2 className="h-5 w-5" />
                Complete
              </button>
              <button
                onClick={() => handleQuickAction(currentItem.id, 'delay')}
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-medium"
              >
                <AlertTriangle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Up Next Section */}
        {nextItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400 px-1">UP NEXT</h3>
            {nextItems.map((item, index) => {
              const Icon = CATEGORY_ICONS[item.category] || Clock;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-gray-800 rounded-xl p-4 flex items-center gap-4",
                    index === 0 && "border border-gray-700"
                  )}
                >
                  <div className="p-3 bg-gray-700 rounded-xl">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.time}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </div>
              );
            })}
          </div>
        )}

        {/* Full Schedule */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 px-1">FULL SCHEDULE</h3>
          {sortedItems.map(item => {
            const Icon = CATEGORY_ICONS[item.category] || Clock;
            const isComplete = item.status === 'completed';
            const isCurrent = item.id === currentItem?.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-gray-800 rounded-xl p-4 flex items-center gap-3",
                  isComplete && "opacity-50",
                  isCurrent && "ring-2 ring-indigo-500"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isComplete ? "bg-green-900" : "bg-gray-700"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium truncate", isComplete && "line-through")}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.time}</span>
                    {item.location && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.location}</span>
                      </>
                    )}
                  </div>
                </div>

                {!isComplete && !isCurrent && (
                  <button
                    onClick={() => handleQuickAction(item.id, 'complete')}
                    className="p-2 text-gray-500 hover:text-green-400 hover:bg-gray-700 rounded-lg"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                )}

                {item.status === 'delayed' && (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                    Delayed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Fixed Bottom Quick Contacts */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4">
        <div className="flex items-center justify-between gap-2">
          {primaryContacts.map(contact => (
            <a
              key={contact.id}
              href={`tel:${contact.phone}`}
              className="flex-1 flex flex-col items-center gap-1 py-2 bg-gray-800 rounded-xl hover:bg-gray-700"
            >
              <Phone className="h-5 w-5 text-green-400" />
              <span className="text-xs truncate max-w-full px-1">{contact.role}</span>
            </a>
          ))}
          <button
            onClick={() => setShowContacts(true)}
            className="flex flex-col items-center gap-1 py-2 px-4 bg-red-600 rounded-xl hover:bg-red-700"
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">SOS</span>
          </button>
        </div>
      </footer>

      {/* Emergency Contacts Panel */}
      {showContacts && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-gray-900 rounded-t-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Emergency Contacts</h3>
              <button
                onClick={() => setShowContacts(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Dial */}
            <div className="p-4 grid grid-cols-3 gap-3">
              <a
                href="tel:100"
                className="flex flex-col items-center gap-2 p-4 bg-blue-600 rounded-xl"
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm font-medium">Police</span>
                <span className="text-lg font-bold">100</span>
              </a>
              <a
                href="tel:102"
                className="flex flex-col items-center gap-2 p-4 bg-red-600 rounded-xl"
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm font-medium">Ambulance</span>
                <span className="text-lg font-bold">102</span>
              </a>
              <a
                href="tel:101"
                className="flex flex-col items-center gap-2 p-4 bg-orange-600 rounded-xl"
              >
                <Phone className="h-6 w-6" />
                <span className="text-sm font-medium">Fire</span>
                <span className="text-lg font-bold">101</span>
              </a>
            </div>

            {/* Contact List */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-[50vh]">
              {emergencyContacts.map(contact => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700"
                >
                  <div className="p-3 bg-green-600 rounded-full">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-400">{contact.role}</p>
                  </div>
                  <span className="text-green-400 font-mono">{contact.phone}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Side Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="bg-gray-900 w-64 h-full p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="font-bold text-lg">{eventName}</h2>
              <p className="text-sm text-gray-400">{format(new Date(eventDate), 'd MMMM yyyy')}</p>
            </div>

            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl text-left">
                <Clock className="h-5 w-5" />
                Schedule
              </button>
              <button
                onClick={() => {
                  setShowContacts(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl text-left"
              >
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl text-left">
                <Users className="h-5 w-5" />
                Team
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl text-left">
                <Volume2 className="h-5 w-5" />
                Announcements
              </button>
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                <span className="text-sm">Live Mode</span>
                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors",
                    isLiveMode ? "bg-green-500" : "bg-gray-600"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full transition-transform",
                    isLiveMode ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
