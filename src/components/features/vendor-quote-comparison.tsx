'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Star,
  MapPin,
  Phone,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Trophy,
  IndianRupee,
  Scale,
  ArrowUpDown,
  Filter,
  Building2,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vendor {
  id: string;
  business_name: string;
  business_type: string;
  city: string;
  phone?: string;
  email?: string;
  average_rating?: number;
  total_reviews?: number;
  logo_url?: string;
}

interface Quote {
  id: string;
  vendor_id: string;
  vendor: Vendor;
  service_type: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  quoted_price_inr?: number;
  vendor_response?: string;
  budget_range?: string;
  guest_count?: number;
  created_at: string;
  response_date?: string;
}

interface VendorQuoteComparisonProps {
  quotes: Quote[];
  onAccept?: (quoteId: string) => Promise<void>;
  onReject?: (quoteId: string) => Promise<void>;
  onContact?: (vendorId: string) => void;
}

type SortField = 'price' | 'rating' | 'response_time' | 'name';
type SortDirection = 'asc' | 'desc';

const SERVICE_TYPES: Record<string, string> = {
  photography: 'Photography',
  videography: 'Videography',
  catering: 'Catering',
  decoration: 'Decoration',
  makeup: 'Makeup & Styling',
  mehendi: 'Mehendi',
  dj: 'DJ & Music',
  venue: 'Venue',
  pandit: 'Pandit Ji',
  transport: 'Transportation',
  invitations: 'Invitations',
  flowers: 'Flowers & Garlands',
};

export function VendorQuoteComparison({
  quotes,
  onAccept,
  onReject,
  onContact,
}: VendorQuoteComparisonProps) {
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Get unique service types from quotes
  const serviceTypes = useMemo(() => {
    const types = new Set(quotes.map(q => q.service_type));
    return Array.from(types).sort();
  }, [quotes]);

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let filtered = quotes.filter(q => q.status === 'quoted');

    if (selectedServiceType !== 'all') {
      filtered = filtered.filter(q => q.service_type === selectedServiceType);
    }

    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'price':
          comparison = (a.quoted_price_inr || 0) - (b.quoted_price_inr || 0);
          break;
        case 'rating':
          comparison = (b.vendor.average_rating || 0) - (a.vendor.average_rating || 0);
          break;
        case 'response_time':
          const aTime = a.response_date ? new Date(a.response_date).getTime() - new Date(a.created_at).getTime() : Infinity;
          const bTime = b.response_date ? new Date(b.response_date).getTime() - new Date(b.created_at).getTime() : Infinity;
          comparison = aTime - bTime;
          break;
        case 'name':
          comparison = a.vendor.business_name.localeCompare(b.vendor.business_name);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [quotes, selectedServiceType, sortField, sortDirection]);

  // Find the best options
  const bestOptions = useMemo(() => {
    if (filteredQuotes.length === 0) return { cheapest: null, bestRated: null, bestValue: null };

    const quotedQuotes = filteredQuotes.filter(q => q.quoted_price_inr);
    if (quotedQuotes.length === 0) return { cheapest: null, bestRated: null, bestValue: null };

    const cheapest = quotedQuotes.reduce((min, q) =>
      (q.quoted_price_inr || 0) < (min.quoted_price_inr || 0) ? q : min
    );

    const bestRated = quotedQuotes.reduce((max, q) =>
      (q.vendor.average_rating || 0) > (max.vendor.average_rating || 0) ? q : max
    );

    // Best value = highest rating / price ratio
    const bestValue = quotedQuotes.reduce((best, q) => {
      const currentValue = (q.vendor.average_rating || 0) / ((q.quoted_price_inr || 1) / 100000);
      const bestValueRatio = (best.vendor.average_rating || 0) / ((best.quoted_price_inr || 1) / 100000);
      return currentValue > bestValueRatio ? q : best;
    });

    return { cheapest, bestRated, bestValue };
  }, [filteredQuotes]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleCompareSelect = (quoteId: string) => {
    setSelectedForCompare(prev =>
      prev.includes(quoteId)
        ? prev.filter(id => id !== quoteId)
        : prev.length < 3 ? [...prev, quoteId] : prev
    );
  };

  const formatPrice = (paise?: number) => {
    if (!paise) return 'Not quoted';
    return `Rs ${(paise / 100).toLocaleString('en-IN')}`;
  };

  const getResponseTime = (quote: Quote) => {
    if (!quote.response_date) return null;
    const created = new Date(quote.created_at);
    const responded = new Date(quote.response_date);
    const hours = Math.round((responded.getTime() - created.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  // Calculate price comparison stats
  const priceStats = useMemo(() => {
    const prices = filteredQuotes
      .filter(q => q.quoted_price_inr)
      .map(q => q.quoted_price_inr!);

    if (prices.length === 0) return null;

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return { avg, min, max };
  }, [filteredQuotes]);

  const pendingCount = quotes.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quote Comparison</h2>
          <p className="text-sm text-gray-500">
            Compare quotes from {filteredQuotes.length} vendors
            {pendingCount > 0 && ` (${pendingCount} awaiting response)`}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              compareMode
                ? "bg-rose-100 text-rose-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <Scale className="h-4 w-4" />
            {compareMode ? 'Exit Compare' : 'Compare Mode'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Services</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>
                {SERVICE_TYPES[type] || type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([
            { field: 'price' as SortField, label: 'Price' },
            { field: 'rating' as SortField, label: 'Rating' },
            { field: 'name' as SortField, label: 'Name' },
          ]).map(({ field, label }) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                sortField === field
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {label}
              {sortField === field && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      {priceStats && (
        <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
          <div className="text-center">
            <p className="text-xs text-amber-600 font-medium">Lowest Quote</p>
            <p className="text-lg font-bold text-amber-900">{formatPrice(priceStats.min)}</p>
          </div>
          <div className="text-center border-x border-amber-200">
            <p className="text-xs text-amber-600 font-medium">Average</p>
            <p className="text-lg font-bold text-amber-900">{formatPrice(priceStats.avg)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-amber-600 font-medium">Highest Quote</p>
            <p className="text-lg font-bold text-amber-900">{formatPrice(priceStats.max)}</p>
          </div>
        </div>
      )}

      {/* Best Options Badges */}
      {(bestOptions.cheapest || bestOptions.bestRated || bestOptions.bestValue) && (
        <div className="flex flex-wrap gap-2">
          {bestOptions.cheapest && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm">
              <IndianRupee className="h-4 w-4" />
              <span className="font-medium">Best Price:</span>
              <span>{bestOptions.cheapest.vendor.business_name}</span>
            </div>
          )}
          {bestOptions.bestRated && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm">
              <Star className="h-4 w-4" />
              <span className="font-medium">Top Rated:</span>
              <span>{bestOptions.bestRated.vendor.business_name}</span>
            </div>
          )}
          {bestOptions.bestValue && bestOptions.bestValue.id !== bestOptions.cheapest?.id && (
            <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Best Value:</span>
              <span>{bestOptions.bestValue.vendor.business_name}</span>
            </div>
          )}
        </div>
      )}

      {/* Compare Selection Info */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{selectedForCompare.length}</span> of 3 vendors selected for comparison
            </p>
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Quote Cards */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No quotes received yet</h3>
            <p className="text-gray-500 mt-1">
              {pendingCount > 0
                ? `${pendingCount} vendors are yet to respond`
                : 'Send quote requests to vendors to get started'
              }
            </p>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const isExpanded = expandedQuoteId === quote.id;
            const isBestPrice = bestOptions.cheapest?.id === quote.id;
            const isBestRated = bestOptions.bestRated?.id === quote.id;
            const isBestValue = bestOptions.bestValue?.id === quote.id && !isBestPrice;
            const isSelected = selectedForCompare.includes(quote.id);
            const responseTime = getResponseTime(quote);

            return (
              <div
                key={quote.id}
                className={cn(
                  "rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-blue-400 bg-blue-50/50"
                    : isBestPrice
                      ? "border-green-300 bg-green-50/50"
                      : isBestRated
                        ? "border-amber-300 bg-amber-50/50"
                        : "border-gray-200 bg-white"
                )}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Compare Checkbox */}
                    {compareMode && (
                      <button
                        onClick={() => toggleCompareSelect(quote.id)}
                        className={cn(
                          "mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-300 hover:border-blue-400"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    )}

                    {/* Vendor Logo */}
                    <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {quote.vendor.logo_url ? (
                        <img
                          src={quote.vendor.logo_url}
                          alt={quote.vendor.business_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {quote.vendor.business_name}
                            </h3>
                            {isBestPrice && (
                              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                Best Price
                              </span>
                            )}
                            {isBestRated && (
                              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                Top Rated
                              </span>
                            )}
                            {isBestValue && (
                              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                Best Value
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {quote.vendor.city}
                            </span>
                            {quote.vendor.average_rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                {quote.vendor.average_rating.toFixed(1)}
                                {quote.vendor.total_reviews && (
                                  <span className="text-gray-400">
                                    ({quote.vendor.total_reviews})
                                  </span>
                                )}
                              </span>
                            )}
                            {responseTime && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Clock className="h-3 w-3" />
                                Responded in {responseTime}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(quote.quoted_price_inr)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {SERVICE_TYPES[quote.service_type] || quote.service_type}
                          </p>
                        </div>
                      </div>

                      {/* Quote Response Preview */}
                      {quote.vendor_response && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          "{quote.vendor_response}"
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        {onAccept && (
                          <button
                            onClick={() => onAccept(quote.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            Accept Quote
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => onReject(quote.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            Decline
                          </button>
                        )}
                        {onContact && (
                          <button
                            onClick={() => onContact(quote.vendor_id)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            Contact
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                          className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <>
                              Less <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Details <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Service Type</p>
                          <p className="font-medium">
                            {SERVICE_TYPES[quote.service_type] || quote.service_type}
                          </p>
                        </div>
                        {quote.guest_count && (
                          <div>
                            <p className="text-gray-500">Guest Count</p>
                            <p className="font-medium">{quote.guest_count} guests</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Quote Requested</p>
                          <p className="font-medium">
                            {format(new Date(quote.created_at), 'd MMM yyyy')}
                          </p>
                        </div>
                        {quote.response_date && (
                          <div>
                            <p className="text-gray-500">Quote Received</p>
                            <p className="font-medium">
                              {format(new Date(quote.response_date), 'd MMM yyyy')}
                            </p>
                          </div>
                        )}
                      </div>

                      {quote.vendor_response && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Vendor's Response</p>
                          <p className="text-sm text-gray-700">{quote.vendor_response}</p>
                        </div>
                      )}

                      {quote.vendor.phone && (
                        <div className="flex items-center gap-4 text-sm">
                          <a
                            href={`tel:${quote.vendor.phone}`}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Phone className="h-4 w-4" />
                            {quote.vendor.phone}
                          </a>
                          {quote.vendor.email && (
                            <a
                              href={`mailto:${quote.vendor.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {quote.vendor.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pending Quotes Section */}
      {pendingCount > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">
                {pendingCount} vendor{pendingCount > 1 ? 's' : ''} yet to respond
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                You have pending quote requests. Vendors typically respond within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table (when 2+ vendors selected) */}
      {compareMode && selectedForCompare.length >= 2 && (
        <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <h3 className="font-semibold text-blue-900">Side-by-Side Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Attribute
                  </th>
                  {selectedForCompare.map(id => {
                    const quote = filteredQuotes.find(q => q.id === id);
                    return (
                      <th key={id} className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                        {quote?.vendor.business_name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500">Price</td>
                  {selectedForCompare.map(id => {
                    const quote = filteredQuotes.find(q => q.id === id);
                    return (
                      <td key={id} className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatPrice(quote?.quoted_price_inr)}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500">Rating</td>
                  {selectedForCompare.map(id => {
                    const quote = filteredQuotes.find(q => q.id === id);
                    return (
                      <td key={id} className="px-4 py-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          {quote?.vendor.average_rating?.toFixed(1) || 'N/A'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500">Reviews</td>
                  {selectedForCompare.map(id => {
                    const quote = filteredQuotes.find(q => q.id === id);
                    return (
                      <td key={id} className="px-4 py-3 text-sm text-gray-900">
                        {quote?.vendor.total_reviews || 0} reviews
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500">Location</td>
                  {selectedForCompare.map(id => {
                    const quote = filteredQuotes.find(q => q.id === id);
                    return (
                      <td key={id} className="px-4 py-3 text-sm text-gray-900">
                        {quote?.vendor.city}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-500">Response Time</td>
                  {selectedForCompare.map(id => {
                    const quote = filteredQuotes.find(q => q.id === id);
                    return (
                      <td key={id} className="px-4 py-3 text-sm text-gray-900">
                        {quote ? getResponseTime(quote) || 'N/A' : 'N/A'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
