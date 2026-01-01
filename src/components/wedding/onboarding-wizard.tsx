'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Calendar,
  Users,
  Wallet,
  PartyPopper,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Clock,
  Crown,
  Leaf,
  Building2,
  Plane,
  Users2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeddingOnboardingWizardProps {
  organizationId: string;
  organizationSlug: string;
}

interface WeddingFormData {
  // Step 1: Couple Details
  brideName: string;
  groomName: string;
  brideFamily: string;
  groomFamily: string;
  loveStory: string;
  slug: string;

  // Step 2: Date & Venue
  weddingDate: string;
  venueName: string;
  venueCity: string;

  // Step 3: Guest Count
  guestCountEstimate: 'intimate' | 'small' | 'medium' | 'large' | 'grand';
  exactGuestCount: string;

  // Step 4: Wedding Style
  weddingStyle: 'traditional' | 'modern' | 'destination' | 'intimate' | 'royal' | 'eco_friendly';

  // Step 5: Budget
  budgetRange: 'budget' | 'moderate' | 'premium' | 'luxury' | 'ultra_luxury';
  exactBudget: string;

  // Step 6: Functions
  selectedFunctions: string[];

  // Contact
  primaryContactPhone: string;
}

const GUEST_COUNT_OPTIONS = [
  { value: 'intimate', label: 'Intimate', range: 'Under 50 guests', icon: Heart, description: 'Close family & friends only' },
  { value: 'small', label: 'Small', range: '50-150 guests', icon: Users2, description: 'Extended family & close friends' },
  { value: 'medium', label: 'Medium', range: '150-300 guests', icon: Users, description: 'Family, friends & colleagues' },
  { value: 'large', label: 'Large', range: '300-500 guests', icon: Users, description: 'Big fat Indian wedding!' },
  { value: 'grand', label: 'Grand', range: '500+ guests', icon: Crown, description: 'Royal celebration' },
];

const WEDDING_STYLE_OPTIONS = [
  { value: 'traditional', label: 'Traditional', icon: Heart, color: 'rose', description: 'Classic rituals & customs' },
  { value: 'modern', label: 'Modern', icon: Sparkles, color: 'violet', description: 'Contemporary & chic' },
  { value: 'destination', label: 'Destination', icon: Plane, color: 'sky', description: 'Exotic location wedding' },
  { value: 'intimate', label: 'Intimate', icon: Users2, color: 'amber', description: 'Small & meaningful' },
  { value: 'royal', label: 'Royal', icon: Crown, color: 'yellow', description: 'Grand & luxurious' },
  { value: 'eco_friendly', label: 'Eco-Friendly', icon: Leaf, color: 'green', description: 'Sustainable celebration' },
];

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-Friendly', range: 'Under ₹10 Lakhs', color: 'emerald', description: 'Smart & beautiful' },
  { value: 'moderate', label: 'Moderate', range: '₹10-25 Lakhs', color: 'blue', description: 'Balanced & elegant' },
  { value: 'premium', label: 'Premium', range: '₹25-50 Lakhs', color: 'violet', description: 'Upscale & refined' },
  { value: 'luxury', label: 'Luxury', range: '₹50 Lakhs - 1 Crore', color: 'amber', description: 'Lavish & memorable' },
  { value: 'ultra_luxury', label: 'Ultra Luxury', range: 'Above ₹1 Crore', color: 'rose', description: 'No limits' },
];

const WEDDING_FUNCTIONS = [
  { id: 'engagement', name: 'Engagement', emoji: '💍', description: 'Ring ceremony' },
  { id: 'roka', name: 'Roka', emoji: '🤝', description: 'Formal agreement' },
  { id: 'mehendi', name: 'Mehendi', emoji: '🌿', description: 'Henna ceremony' },
  { id: 'haldi', name: 'Haldi', emoji: '💛', description: 'Turmeric ceremony' },
  { id: 'sangeet', name: 'Sangeet', emoji: '💃', description: 'Music & dance night' },
  { id: 'cocktail', name: 'Cocktail Party', emoji: '🍸', description: 'Pre-wedding party' },
  { id: 'wedding', name: 'Wedding Ceremony', emoji: '💒', description: 'Main ceremony' },
  { id: 'reception', name: 'Reception', emoji: '🎉', description: 'Grand celebration' },
  { id: 'vidaai', name: 'Vidaai', emoji: '👋', description: 'Farewell ceremony' },
];

const STEPS = [
  { id: 1, title: 'Couple', icon: Heart },
  { id: 2, title: 'Date & Venue', icon: Calendar },
  { id: 3, title: 'Guests', icon: Users },
  { id: 4, title: 'Style', icon: Sparkles },
  { id: 5, title: 'Budget', icon: Wallet },
  { id: 6, title: 'Functions', icon: PartyPopper },
];

export function WeddingOnboardingWizard({ organizationId, organizationSlug }: WeddingOnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<WeddingFormData>({
    brideName: '',
    groomName: '',
    brideFamily: '',
    groomFamily: '',
    loveStory: '',
    slug: '',
    weddingDate: '',
    venueName: '',
    venueCity: '',
    guestCountEstimate: 'medium',
    exactGuestCount: '',
    weddingStyle: 'traditional',
    budgetRange: 'moderate',
    exactBudget: '',
    selectedFunctions: ['mehendi', 'haldi', 'sangeet', 'wedding', 'reception'],
    primaryContactPhone: '',
  });

  // Calculate days remaining and urgency
  const urgencyInfo = useMemo(() => {
    if (!formData.weddingDate) return null;

    const weddingDate = new Date(formData.weddingDate);
    const today = new Date();
    const daysRemaining = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { level: 'past', message: 'Wedding date has passed', color: 'gray', icon: Clock };
    } else if (daysRemaining === 0) {
      return { level: 'today', message: "It's your wedding day!", color: 'rose', icon: Heart, daysRemaining };
    } else if (daysRemaining <= 7) {
      return { level: 'critical', message: `Only ${daysRemaining} days left!`, color: 'red', icon: AlertTriangle, daysRemaining };
    } else if (daysRemaining <= 30) {
      return { level: 'urgent', message: `${daysRemaining} days remaining`, color: 'amber', icon: Clock, daysRemaining };
    } else if (daysRemaining <= 90) {
      return { level: 'soon', message: `${daysRemaining} days to go`, color: 'yellow', icon: Calendar, daysRemaining };
    } else if (daysRemaining <= 180) {
      return { level: 'planned', message: `${daysRemaining} days ahead`, color: 'green', icon: Calendar, daysRemaining };
    } else {
      return { level: 'distant', message: `${daysRemaining} days to plan`, color: 'blue', icon: Calendar, daysRemaining };
    }
  }, [formData.weddingDate]);

  const updateFormData = (updates: Partial<WeddingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const generateSlug = (bride: string, groom: string) => {
    const combined = `${bride}-${groom}-wedding`.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return combined;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const title = `${formData.brideName} & ${formData.groomName}'s Wedding`;
      const slug = formData.slug || generateSlug(formData.brideName, formData.groomName);

      const response = await fetch('/api/events/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          title,
          slug,
          description: formData.loveStory,
          startDate: formData.weddingDate,
          venueName: formData.venueName,
          venueCity: formData.venueCity,
          capacity: formData.exactGuestCount ? parseInt(formData.exactGuestCount) : getDefaultCapacity(formData.guestCountEstimate),
          weddingStyle: formData.weddingStyle,
          budgetRange: formData.budgetRange,
          guestCountEstimate: formData.guestCountEstimate,
          totalBudget: formData.exactBudget ? parseFloat(formData.exactBudget) : null,
          weddingFunctions: formData.selectedFunctions,
          brideName: formData.brideName,
          groomName: formData.groomName,
          brideFamilyName: formData.brideFamily,
          groomFamilyName: formData.groomFamily,
          primaryContactPhone: formData.primaryContactPhone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create wedding');
      }

      const { eventId } = await response.json();
      router.push(`/events/${eventId}/setup-timeline`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDefaultCapacity = (estimate: string) => {
    switch (estimate) {
      case 'intimate': return 50;
      case 'small': return 150;
      case 'medium': return 300;
      case 'large': return 500;
      case 'grand': return 800;
      default: return 300;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.brideName.trim() && formData.groomName.trim();
      case 2:
        return formData.weddingDate && formData.venueCity.trim();
      case 3:
        return true; // Has default
      case 4:
        return true; // Has default
      case 5:
        return true; // Has default
      case 6:
        return formData.selectedFunctions.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="relative flex flex-col items-center z-10">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isActive && "border-rose-600 bg-rose-600 text-white scale-110 shadow-lg",
                    isCompleted && "border-rose-600 bg-rose-600 text-white cursor-pointer hover:scale-105",
                    !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </button>
                <span className={cn(
                  "mt-2 text-xs font-medium",
                  isActive ? "text-rose-700" : isCompleted ? "text-rose-600" : "text-gray-400"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border-2 border-rose-100 shadow-xl overflow-hidden">
        {/* Step 1: Couple Details */}
        {currentStep === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
                  <Heart className="h-8 w-8 text-white fill-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Let's Start With You Two</h2>
              <p className="text-gray-600 mt-2">Tell us about the lovely couple</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bride's Name *
                </label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => updateFormData({ brideName: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="Priya"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groom's Name *
                </label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => updateFormData({ groomName: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="Rahul"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bride's Family Name
                </label>
                <input
                  type="text"
                  value={formData.brideFamily}
                  onChange={(e) => updateFormData({ brideFamily: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groom's Family Name
                </label>
                <input
                  type="text"
                  value={formData.groomFamily}
                  onChange={(e) => updateFormData({ groomFamily: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="Gupta"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Love Story (Optional)
              </label>
              <textarea
                value={formData.loveStory}
                onChange={(e) => updateFormData({ loveStory: e.target.value })}
                rows={3}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                placeholder="How did you two meet? Share your story..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.primaryContactPhone}
                onChange={(e) => updateFormData({ primaryContactPhone: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        )}

        {/* Step 2: Date & Venue */}
        {currentStep === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">When & Where</h2>
              <p className="text-gray-600 mt-2">The date and venue of your celebration</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Date *
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => updateFormData({ weddingDate: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Urgency Indicator */}
              {urgencyInfo && (
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2",
                  urgencyInfo.level === 'critical' && "bg-red-50 border-red-200",
                  urgencyInfo.level === 'urgent' && "bg-amber-50 border-amber-200",
                  urgencyInfo.level === 'soon' && "bg-yellow-50 border-yellow-200",
                  urgencyInfo.level === 'planned' && "bg-green-50 border-green-200",
                  urgencyInfo.level === 'distant' && "bg-blue-50 border-blue-200",
                  urgencyInfo.level === 'today' && "bg-rose-50 border-rose-200",
                  urgencyInfo.level === 'past' && "bg-gray-50 border-gray-200",
                )}>
                  <urgencyInfo.icon className={cn(
                    "h-6 w-6",
                    urgencyInfo.level === 'critical' && "text-red-600",
                    urgencyInfo.level === 'urgent' && "text-amber-600",
                    urgencyInfo.level === 'soon' && "text-yellow-600",
                    urgencyInfo.level === 'planned' && "text-green-600",
                    urgencyInfo.level === 'distant' && "text-blue-600",
                    urgencyInfo.level === 'today' && "text-rose-600",
                    urgencyInfo.level === 'past' && "text-gray-600",
                  )} />
                  <div className="flex-1">
                    <p className={cn(
                      "font-semibold",
                      urgencyInfo.level === 'critical' && "text-red-800",
                      urgencyInfo.level === 'urgent' && "text-amber-800",
                      urgencyInfo.level === 'soon' && "text-yellow-800",
                      urgencyInfo.level === 'planned' && "text-green-800",
                      urgencyInfo.level === 'distant' && "text-blue-800",
                      urgencyInfo.level === 'today' && "text-rose-800",
                      urgencyInfo.level === 'past' && "text-gray-800",
                    )}>
                      {urgencyInfo.message}
                    </p>
                    {urgencyInfo.level === 'critical' && (
                      <p className="text-sm text-red-600">Time is tight! We'll prioritize your essential tasks.</p>
                    )}
                    {urgencyInfo.level === 'urgent' && (
                      <p className="text-sm text-amber-600">Let's focus on booking vendors and finalizing major decisions.</p>
                    )}
                    {urgencyInfo.level === 'planned' && (
                      <p className="text-sm text-green-600">Great timeline! You have time to plan everything perfectly.</p>
                    )}
                    {urgencyInfo.level === 'distant' && (
                      <p className="text-sm text-blue-600">Perfect! Plenty of time to explore options and get the best deals.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Venue Name
                </label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => updateFormData({ venueName: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="The Grand Palace, ITC Maurya..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.venueCity}
                  onChange={(e) => updateFormData({ venueCity: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="Mumbai, Delhi, Jaipur..."
                />
                <p className="text-sm text-gray-500 mt-1">This helps us recommend local vendors</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Guest Count */}
        {currentStep === 3 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">How Many Guests?</h2>
              <p className="text-gray-600 mt-2">This helps us suggest the right venue size and catering</p>
            </div>

            <div className="grid gap-4">
              {GUEST_COUNT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.guestCountEstimate === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormData({ guestCountEstimate: option.value as any })}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-rose-500 bg-rose-50 shadow-md"
                        : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      isSelected ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{option.label}</span>
                        <span className="text-sm text-gray-500">({option.range})</span>
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-6 w-6 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter exact number (optional)
              </label>
              <input
                type="number"
                value={formData.exactGuestCount}
                onChange={(e) => updateFormData({ exactGuestCount: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                placeholder="350"
              />
            </div>
          </div>
        )}

        {/* Step 4: Wedding Style */}
        {currentStep === 4 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Your Wedding Style</h2>
              <p className="text-gray-600 mt-2">What vibe are you going for?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {WEDDING_STYLE_OPTIONS.map((style) => {
                const Icon = style.icon;
                const isSelected = formData.weddingStyle === style.value;

                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateFormData({ weddingStyle: style.value as any })}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-rose-500 bg-rose-50 shadow-md"
                        : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      isSelected ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">{style.label}</span>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-6 w-6 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Budget */}
        {currentStep === 5 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Budget Range</h2>
              <p className="text-gray-600 mt-2">This helps us suggest appropriate vendors and services</p>
            </div>

            <div className="space-y-4">
              {BUDGET_OPTIONS.map((budget) => {
                const isSelected = formData.budgetRange === budget.value;

                return (
                  <button
                    key={budget.value}
                    type="button"
                    onClick={() => updateFormData({ budgetRange: budget.value as any })}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-rose-500 bg-rose-50 shadow-md"
                        : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        isSelected ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600"
                      )}>
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{budget.label}</span>
                        <p className="text-sm text-gray-600">{budget.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        isSelected ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-700"
                      )}>
                        {budget.range}
                      </span>
                      {isSelected && <Check className="h-5 w-5 text-rose-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter exact budget in ₹ (optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={formData.exactBudget}
                  onChange={(e) => updateFormData({ exactBudget: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 pl-8 pr-4 py-3 focus:border-rose-500 focus:outline-none transition-colors"
                  placeholder="25,00,000"
                />
              </div>
            </div>

            {/* Budget Tips */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">💡 Budget Tip</h4>
              <p className="text-sm text-amber-700">
                A typical Indian wedding budget allocation: Venue (20-25%), Catering (25-30%),
                Photography (10-15%), Decoration (10-15%), Attire & Jewelry (10-15%),
                Entertainment (5-10%), and Contingency (5-10%).
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Functions Selection */}
        {currentStep === 6 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg">
                  <PartyPopper className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Wedding Functions</h2>
              <p className="text-gray-600 mt-2">Select all the events you're planning</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {WEDDING_FUNCTIONS.map((func) => {
                const isSelected = formData.selectedFunctions.includes(func.id);

                return (
                  <button
                    key={func.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateFormData({
                          selectedFunctions: formData.selectedFunctions.filter(f => f !== func.id)
                        });
                      } else {
                        updateFormData({
                          selectedFunctions: [...formData.selectedFunctions, func.id]
                        });
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-rose-500 bg-rose-50 shadow-md"
                        : "border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
                    )}
                  >
                    <span className="text-3xl mb-2">{func.emoji}</span>
                    <span className="font-semibold text-gray-900">{func.name}</span>
                    <span className="text-xs text-gray-500">{func.description}</span>
                    {isSelected && (
                      <div className="mt-2">
                        <Check className="h-5 w-5 text-rose-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Selected: {formData.selectedFunctions.length} functions
            </p>

            {/* Summary Preview */}
            <div className="mt-8 p-6 bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl border border-rose-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-600" />
                Wedding Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="text-gray-500">Couple:</span> <span className="font-medium">{formData.brideName} & {formData.groomName}</span></p>
                  <p><span className="text-gray-500">Date:</span> <span className="font-medium">{formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</span></p>
                  <p><span className="text-gray-500">City:</span> <span className="font-medium">{formData.venueCity || 'Not set'}</span></p>
                </div>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Style:</span> <span className="font-medium capitalize">{formData.weddingStyle.replace('_', ' ')}</span></p>
                  <p><span className="text-gray-500">Guests:</span> <span className="font-medium">{GUEST_COUNT_OPTIONS.find(o => o.value === formData.guestCountEstimate)?.range}</span></p>
                  <p><span className="text-gray-500">Budget:</span> <span className="font-medium">{BUDGET_OPTIONS.find(o => o.value === formData.budgetRange)?.range}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-8 py-6 bg-gray-50 border-t flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
              currentStep === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
            Previous
          </button>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                canProceed()
                  ? "bg-rose-600 text-white hover:bg-rose-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all",
                isSubmitting || !canProceed()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-lg hover:shadow-xl"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create My Wedding
                  <Heart className="h-5 w-5 fill-white" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
