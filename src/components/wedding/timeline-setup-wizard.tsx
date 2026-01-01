'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Sunrise,
  CloudSun,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Users,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, setHours, setMinutes } from 'date-fns';

interface TimelineSetupWizardProps {
  eventId: string;
  weddingDate: string;
  venueName?: string;
  venueCity?: string;
  guestCount?: number;
}

interface EventConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  typicalDuration: number; // in hours
  suggestedTime: 'morning' | 'afternoon' | 'evening' | 'night';
  daysBefore: number;
  suggestedDressCode: string;
  venueSuggestion: string;
  isDefault?: boolean;
  seasonTips: {
    summer: string;
    winter: string;
    monsoon: string;
  };
}

const WEDDING_EVENTS: EventConfig[] = [
  {
    id: 'engagement',
    name: 'Engagement',
    emoji: '💍',
    description: 'Ring ceremony and celebration',
    typicalDuration: 4,
    suggestedTime: 'morning',
    daysBefore: 30,
    suggestedDressCode: 'Semi-Formal Indian',
    venueSuggestion: 'Banquet hall or home',
    seasonTips: {
      summer: 'Consider AC venue, keep hydration stations',
      winter: 'Indoor venue preferred, warm lighting',
      monsoon: 'Indoor venue essential, backup parking plan',
    },
  },
  {
    id: 'roka',
    name: 'Roka',
    emoji: '🤝',
    description: 'Formal agreement between families',
    typicalDuration: 2,
    suggestedTime: 'morning',
    daysBefore: 45,
    suggestedDressCode: 'Traditional Indian',
    venueSuggestion: 'Home or small banquet',
    seasonTips: {
      summer: 'Morning ceremony to avoid heat',
      winter: 'Afternoon works well',
      monsoon: 'Ensure indoor backup',
    },
  },
  {
    id: 'mehendi',
    name: 'Mehendi',
    emoji: '🌿',
    description: 'Henna application ceremony',
    typicalDuration: 5,
    suggestedTime: 'afternoon',
    daysBefore: 2,
    suggestedDressCode: 'Colorful Indian Wear',
    venueSuggestion: 'Lawn, poolside, or indoor with good ventilation',
    isDefault: true,
    seasonTips: {
      summer: 'Covered area with fans/AC, mehendi dries faster',
      winter: 'Indoor preferred, mehendi takes longer to dry',
      monsoon: 'Must be indoor, avoid humidity for better color',
    },
  },
  {
    id: 'haldi',
    name: 'Haldi',
    emoji: '💛',
    description: 'Turmeric ceremony for the couple',
    typicalDuration: 3,
    suggestedTime: 'morning',
    daysBefore: 1,
    suggestedDressCode: 'Yellow/White casual wear',
    venueSuggestion: 'Home courtyard or outdoor lawn',
    isDefault: true,
    seasonTips: {
      summer: 'Early morning (before 10 AM) to avoid sun',
      winter: 'Mid-morning (10-11 AM) when it\'s warmer',
      monsoon: 'Covered area, tarpaulin backup essential',
    },
  },
  {
    id: 'sangeet',
    name: 'Sangeet',
    emoji: '💃',
    description: 'Music, dance, and celebration night',
    typicalDuration: 5,
    suggestedTime: 'evening',
    daysBefore: 1,
    suggestedDressCode: 'Glamorous Indian/Indo-Western',
    venueSuggestion: 'Banquet hall with dance floor and stage',
    isDefault: true,
    seasonTips: {
      summer: 'Indoor AC venue, start after sunset',
      winter: 'Outdoor with bonfires can be magical',
      monsoon: 'Indoor only, good sound system essential',
    },
  },
  {
    id: 'cocktail',
    name: 'Cocktail Party',
    emoji: '🍸',
    description: 'Pre-wedding party with drinks and music',
    typicalDuration: 4,
    suggestedTime: 'night',
    daysBefore: 1,
    suggestedDressCode: 'Western Formal/Indo-Western',
    venueSuggestion: 'Rooftop, pool-side, or upscale lounge',
    seasonTips: {
      summer: 'Rooftop evening party, cooling mist systems',
      winter: 'Indoor lounge with outdoor heater area',
      monsoon: 'Indoor venue with lounge seating',
    },
  },
  {
    id: 'wedding',
    name: 'Wedding Ceremony',
    emoji: '💒',
    description: 'Main wedding rituals and pheras',
    typicalDuration: 6,
    suggestedTime: 'morning',
    daysBefore: 0,
    suggestedDressCode: 'Traditional Wedding Attire',
    venueSuggestion: 'Wedding venue with mandap',
    isDefault: true,
    seasonTips: {
      summer: 'AC mandap area, early morning muhurat',
      winter: 'Outdoor morning ceremony can be beautiful',
      monsoon: 'Waterproof mandap cover essential',
    },
  },
  {
    id: 'reception',
    name: 'Reception',
    emoji: '🎉',
    description: 'Grand dinner and celebration',
    typicalDuration: 5,
    suggestedTime: 'evening',
    daysBefore: 0,
    suggestedDressCode: 'Grand Indian/Designer Wear',
    venueSuggestion: 'Large banquet hall or lawn',
    isDefault: true,
    seasonTips: {
      summer: 'AC hall, lighter menu options',
      winter: 'Outdoor with heating can be romantic',
      monsoon: 'Indoor essential, waterproof decor',
    },
  },
  {
    id: 'vidaai',
    name: 'Vidaai',
    emoji: '👋',
    description: 'Farewell ceremony for the bride',
    typicalDuration: 1,
    suggestedTime: 'night',
    daysBefore: 0,
    suggestedDressCode: 'Wedding outfit',
    venueSuggestion: 'Wedding venue entrance',
    seasonTips: {
      summer: 'Late evening after temperatures cool',
      winter: 'Have shawls ready for the bride',
      monsoon: 'Covered exit area with umbrella backup',
    },
  },
];

const TIME_SLOTS = {
  morning: { label: 'Morning', icon: Sunrise, time: '10:00', color: 'amber' },
  afternoon: { label: 'Afternoon', icon: Sun, time: '14:00', color: 'orange' },
  evening: { label: 'Evening', icon: CloudSun, time: '18:00', color: 'rose' },
  night: { label: 'Night', icon: Moon, time: '20:00', color: 'indigo' },
};

interface SelectedEvent extends EventConfig {
  customDate: string;
  customTime: string;
  customVenue: string;
  expanded: boolean;
}

export function TimelineSetupWizard({
  eventId,
  weddingDate,
  venueName,
  venueCity,
  guestCount,
}: TimelineSetupWizardProps) {
  const router = useRouter();
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>(() => {
    return WEDDING_EVENTS.filter(e => e.isDefault).map(event => ({
      ...event,
      customDate: format(subDays(new Date(weddingDate), event.daysBefore), 'yyyy-MM-dd'),
      customTime: TIME_SLOTS[event.suggestedTime].time,
      customVenue: venueName || '',
      expanded: false,
    }));
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine season based on wedding date
  const season = useMemo(() => {
    const month = new Date(weddingDate).getMonth();
    if (month >= 2 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    return 'winter';
  }, [weddingDate]);

  const seasonLabel = {
    summer: { label: 'Summer Wedding', emoji: '☀️', color: 'amber' },
    monsoon: { label: 'Monsoon Wedding', emoji: '🌧️', color: 'blue' },
    winter: { label: 'Winter Wedding', emoji: '❄️', color: 'sky' },
  }[season];

  const addEvent = (event: EventConfig) => {
    if (selectedEvents.find(e => e.id === event.id)) return;

    setSelectedEvents(prev => [
      ...prev,
      {
        ...event,
        customDate: format(subDays(new Date(weddingDate), event.daysBefore), 'yyyy-MM-dd'),
        customTime: TIME_SLOTS[event.suggestedTime].time,
        customVenue: venueName || '',
        expanded: false,
      },
    ].sort((a, b) => new Date(a.customDate).getTime() - new Date(b.customDate).getTime()));
  };

  const removeEvent = (eventId: string) => {
    setSelectedEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const updateEvent = (eventId: string, updates: Partial<SelectedEvent>) => {
    setSelectedEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  const toggleExpand = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, expanded: !e.expanded } : e))
    );
  };

  // Check for conflicts
  const conflicts = useMemo(() => {
    const issues: string[] = [];
    const sortedEvents = [...selectedEvents].sort(
      (a, b) => new Date(`${a.customDate}T${a.customTime}`).getTime() -
                new Date(`${b.customDate}T${b.customTime}`).getTime()
    );

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];

      const currentEnd = new Date(`${current.customDate}T${current.customTime}`);
      currentEnd.setHours(currentEnd.getHours() + current.typicalDuration);

      const nextStart = new Date(`${next.customDate}T${next.customTime}`);

      if (currentEnd > nextStart) {
        issues.push(`${current.name} ends at ${format(currentEnd, 'h:mm a')} but ${next.name} starts at ${format(nextStart, 'h:mm a')} - consider adjusting times`);
      }

      // Check for too little gap
      const gapHours = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60);
      if (gapHours > 0 && gapHours < 1) {
        issues.push(`Only ${Math.round(gapHours * 60)} minutes between ${current.name} and ${next.name} - guests may need more time to travel/change`);
      }
    }

    return issues;
  }, [selectedEvents]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/events/wedding/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEventId: eventId,
          events: selectedEvents.map(event => ({
            eventName: event.id,
            customEventName: event.name,
            startDatetime: `${event.customDate}T${event.customTime}:00`,
            endDatetime: (() => {
              const end = new Date(`${event.customDate}T${event.customTime}:00`);
              end.setHours(end.getHours() + event.typicalDuration);
              return end.toISOString();
            })(),
            venueName: event.customVenue,
            dressCode: event.suggestedDressCode,
            description: event.description,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create timeline');
      }

      router.push(`/events/${eventId}/wedding-timeline`);
    } catch (error) {
      console.error('Error creating timeline:', error);
      alert('Failed to create timeline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unselectedEvents = WEDDING_EVENTS.filter(
    e => !selectedEvents.find(se => se.id === e.id)
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent mb-2">
          Design Your Wedding Timeline
        </h1>
        <p className="text-gray-600">
          We've pre-selected the most common events. Customize the schedule below.
        </p>
      </div>

      {/* Season Alert */}
      <div className={cn(
        "mb-6 p-4 rounded-xl border-2 flex items-start gap-3",
        season === 'summer' && "bg-amber-50 border-amber-200",
        season === 'monsoon' && "bg-blue-50 border-blue-200",
        season === 'winter' && "bg-sky-50 border-sky-200",
      )}>
        <span className="text-2xl">{seasonLabel.emoji}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{seasonLabel.label}</h3>
          <p className="text-sm text-gray-600">
            {season === 'summer' && "Plan for heat! Consider morning ceremonies, AC venues, and hydration stations."}
            {season === 'monsoon' && "Rain backup is essential! Opt for indoor venues or waterproof arrangements."}
            {season === 'winter' && "Perfect weather for outdoor events! Consider evening outdoor ceremonies with lighting."}
          </p>
        </div>
      </div>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Schedule Conflicts</h3>
          </div>
          <ul className="space-y-1">
            {conflicts.map((conflict, i) => (
              <li key={i} className="text-sm text-amber-700">• {conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Events */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Your Wedding Events</h2>

        {selectedEvents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No events selected. Add events from below.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event, index) => {
              const TimeIcon = TIME_SLOTS[event.suggestedTime].icon;

              return (
                <div
                  key={event.id}
                  className="rounded-xl border-2 border-rose-200 bg-white overflow-hidden"
                >
                  {/* Event Header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-rose-50/50 transition-colors"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <span className="text-2xl">{event.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.customDate), 'EEE, dd MMM')} at {event.customTime}
                        <span className="mx-2">•</span>
                        {event.typicalDuration} hours
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEvent(event.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        ✕
                      </button>
                      {event.expanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {event.expanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-rose-100 space-y-4">
                      {/* Date & Time */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={event.customDate}
                            onChange={(e) => updateEvent(event.id, { customDate: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={event.customTime}
                            onChange={(e) => updateEvent(event.id, { customTime: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>

                      {/* Suggested Time */}
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-700">
                          Recommended: {TIME_SLOTS[event.suggestedTime].label} ({TIME_SLOTS[event.suggestedTime].time})
                          — typical duration is {event.typicalDuration} hours
                        </span>
                      </div>

                      {/* Venue */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Venue
                        </label>
                        <input
                          type="text"
                          value={event.customVenue}
                          onChange={(e) => updateEvent(event.id, { customVenue: e.target.value })}
                          placeholder={event.venueSuggestion}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Suggested: {event.venueSuggestion}
                        </p>
                      </div>

                      {/* Season Tips */}
                      <div className="p-3 rounded-lg bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-rose-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {seasonLabel.label} Tip for {event.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {event.seasonTips[season]}
                        </p>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Palette className="h-4 w-4" />
                          <span>Dress: {event.suggestedDressCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Duration: ~{event.typicalDuration} hours</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add More Events */}
      {unselectedEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add More Events</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {unselectedEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => addEvent(event)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-left"
              >
                <span className="text-xl">{event.emoji}</span>
                <div>
                  <span className="font-medium text-gray-900">{event.name}</span>
                  <p className="text-xs text-gray-500">{event.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Summary */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-rose-600" />
          Timeline Overview
        </h3>
        <div className="space-y-2">
          {selectedEvents
            .sort((a, b) => new Date(`${a.customDate}T${a.customTime}`).getTime() -
                          new Date(`${b.customDate}T${b.customTime}`).getTime())
            .map((event, i) => (
              <div key={event.id} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-gray-500">
                  {format(new Date(event.customDate), 'dd MMM')}
                </span>
                <span className="w-16 text-gray-600">{event.customTime}</span>
                <span>{event.emoji}</span>
                <span className="font-medium text-gray-900">{event.name}</span>
                <span className="text-gray-400">({event.typicalDuration}h)</span>
              </div>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || selectedEvents.length === 0}
          className={cn(
            "flex-1 rounded-xl py-4 font-semibold text-white transition-all flex items-center justify-center gap-2",
            isSubmitting || selectedEvents.length === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg hover:shadow-xl"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Timeline...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Create Timeline ({selectedEvents.length} events)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
