'use client';

import { useState, useTransition, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Users,
  Heart,
  Briefcase,
  Gift,
  Plus,
  Check,
  Clock,
  IndianRupee,
  TrendingUp,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  User,
  X,
  Wallet,
  Handshake,
  SparklesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  addBudgetContribution,
  markContributionReceived,
} from '@/actions/payments';

interface Contribution {
  id: string;
  contributor_name: string;
  contributor_side: 'bride' | 'groom' | 'other';
  contributor_relation?: string;
  amount_inr: number;
  contribution_type: 'monetary' | 'in_kind' | 'service';
  category?: string;
  status: 'pledged' | 'received' | 'pending';
  notes?: string;
  received_date?: string;
  created_at: string;
}

interface ContributionSummary {
  bride: { pledged: number; received: number; pending: number };
  groom: { pledged: number; received: number; pending: number };
  other: { pledged: number; received: number; pending: number };
  total: { pledged: number; received: number; pending: number };
}

interface BudgetContributionsProps {
  eventId: string;
  contributions: Contribution[];
  summary: ContributionSummary;
  totalBudget?: number;
  onUpdate?: () => void;
}

const SIDE_CONFIG = {
  bride: {
    label: "Bride's Side",
    color: 'rose',
    icon: Heart,
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    barClass: 'bg-rose-500',
  },
  groom: {
    label: "Groom's Side",
    color: 'blue',
    icon: Briefcase,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    barClass: 'bg-blue-500',
  },
  other: {
    label: 'Others',
    color: 'amber',
    icon: Gift,
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    barClass: 'bg-amber-500',
  },
};

const CONTRIBUTION_TYPES = [
  { value: 'monetary', label: 'Cash/Bank Transfer', icon: Wallet },
  { value: 'in_kind', label: 'In-Kind (Gifts, Items)', icon: Gift },
  { value: 'service', label: 'Service (e.g., catering by uncle)', icon: Handshake },
];

const RELATION_OPTIONS = [
  'Parents',
  'Grandparents',
  'Uncle/Aunt',
  'Sibling',
  'Cousin',
  'Friend',
  'Other Relative',
  'Family Friend',
  'Employer/Company',
];

const CATEGORY_OPTIONS = [
  'General',
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Attire & Jewelry',
  'Entertainment',
  'Accommodation',
  'Transportation',
];

export function BudgetContributions({
  eventId,
  contributions,
  summary,
  totalBudget,
  onUpdate,
}: BudgetContributionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterSide, setFilterSide] = useState<'all' | 'bride' | 'groom' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pledged' | 'received' | 'pending'>('all');
  const [expandedContribution, setExpandedContribution] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    contributorName: '',
    contributorSide: 'bride' as 'bride' | 'groom' | 'other',
    contributorRelation: '',
    amount: '',
    contributionType: 'monetary' as 'monetary' | 'in_kind' | 'service',
    category: 'General',
    status: 'pledged' as 'pledged' | 'received' | 'pending',
    notes: '',
  });

  // Filtered contributions
  const filteredContributions = useMemo(() => {
    return contributions.filter(c => {
      if (filterSide !== 'all' && c.contributor_side !== filterSide) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      return true;
    });
  }, [contributions, filterSide, filterStatus]);

  // Progress calculations
  const totalPledged = summary.total.pledged;
  const totalReceived = summary.total.received;
  const budgetCoverage = totalBudget && totalBudget > 0
    ? Math.min(100, Math.round((totalReceived / totalBudget) * 100))
    : null;

  const formatAmount = (paise: number) => {
    const rupees = paise / 100;
    if (rupees >= 10000000) return `${(rupees / 10000000).toFixed(1)}Cr`;
    if (rupees >= 100000) return `${(rupees / 100000).toFixed(1)}L`;
    if (rupees >= 1000) return `${(rupees / 1000).toFixed(1)}K`;
    return rupees.toLocaleString('en-IN');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contributorName || !formData.amount) return;

    startTransition(async () => {
      const result = await addBudgetContribution(eventId, {
        contributorName: formData.contributorName,
        contributorSide: formData.contributorSide,
        contributorRelation: formData.contributorRelation || undefined,
        amount: parseFloat(formData.amount) * 100, // Convert to paise
        contributionType: formData.contributionType,
        category: formData.category,
        status: formData.status,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        setShowAddModal(false);
        setFormData({
          contributorName: '',
          contributorSide: 'bride',
          contributorRelation: '',
          amount: '',
          contributionType: 'monetary',
          category: 'General',
          status: 'pledged',
          notes: '',
        });
        onUpdate?.();
      }
    });
  };

  const handleMarkReceived = async (contributionId: string) => {
    startTransition(async () => {
      const result = await markContributionReceived(contributionId);
      if (result.success) {
        onUpdate?.();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Pledged */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <PiggyBank className="h-5 w-5" />
            <span className="text-sm font-medium">Total Pledged</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            Rs {formatAmount(totalPledged)}
          </p>
          {totalBudget && (
            <p className="text-xs text-purple-600 mt-1">
              {Math.round((totalPledged / totalBudget) * 100)}% of budget
            </p>
          )}
        </div>

        {/* Total Received */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">Received</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            Rs {formatAmount(totalReceived)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {totalPledged > 0 ? Math.round((totalReceived / totalPledged) * 100) : 0}% of pledged
          </p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            Rs {formatAmount(summary.total.pending)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {contributions.filter(c => c.status === 'pending').length} contributions
          </p>
        </div>

        {/* Contributors */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Contributors</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {contributions.length}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            family & friends
          </p>
        </div>
      </div>

      {/* Side-by-Side Breakdown */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          Contribution Breakdown
        </h3>

        <div className="space-y-4">
          {(['bride', 'groom', 'other'] as const).map(side => {
            const config = SIDE_CONFIG[side];
            const sideData = summary[side];
            const Icon = config.icon;
            const maxAmount = Math.max(summary.bride.pledged, summary.groom.pledged, summary.other.pledged);
            const barWidth = maxAmount > 0 ? (sideData.pledged / maxAmount) * 100 : 0;

            return (
              <div key={side} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", config.bgClass)}>
                      <Icon className={cn("h-4 w-4", config.textClass)} />
                    </div>
                    <span className="font-medium text-gray-900">{config.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rs {formatAmount(sideData.pledged)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rs {formatAmount(sideData.received)} received
                    </p>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", config.barClass)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contributions List */}
      <div className="bg-white rounded-xl border">
        {/* Header & Filters */}
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Contributions</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['all', 'bride', 'groom', 'other'] as const).map(side => (
                <button
                  key={side}
                  onClick={() => setFilterSide(side)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    filterSide === side
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {side === 'all' ? 'All' : SIDE_CONFIG[side].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-lg border px-3 py-1.5 text-sm"
            >
              <option value="all">All Status</option>
              <option value="received">Received</option>
              <option value="pledged">Pledged</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredContributions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">No contributions yet</h4>
              <p className="text-sm text-gray-500 mt-1">
                Track contributions from family and friends
              </p>
            </div>
          ) : (
            filteredContributions.map(contribution => {
              const sideConfig = SIDE_CONFIG[contribution.contributor_side];
              const SideIcon = sideConfig.icon;
              const isExpanded = expandedContribution === contribution.id;
              const TypeIcon = CONTRIBUTION_TYPES.find(t => t.value === contribution.contribution_type)?.icon || Wallet;

              return (
                <div key={contribution.id} className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Side Indicator */}
                    <div className={cn("p-2 rounded-xl", sideConfig.bgClass)}>
                      <SideIcon className={cn("h-5 w-5", sideConfig.textClass)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">
                          {contribution.contributor_name}
                        </h4>
                        {contribution.contributor_relation && (
                          <span className="text-sm text-gray-500">
                            ({contribution.contributor_relation})
                          </span>
                        )}
                        {contribution.status === 'received' && (
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            Received
                          </span>
                        )}
                        {contribution.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {CONTRIBUTION_TYPES.find(t => t.value === contribution.contribution_type)?.label}
                        </span>
                        {contribution.category && (
                          <span>for {contribution.category}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        Rs {formatAmount(contribution.amount_inr)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(contribution.created_at), 'd MMM yyyy')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {contribution.status !== 'received' && (
                        <button
                          onClick={() => handleMarkReceived(contribution.id)}
                          disabled={isPending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as received"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedContribution(isExpanded ? null : contribution.id)}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 ml-14">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Side</p>
                          <p className="font-medium">{sideConfig.label}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium capitalize">{contribution.status}</p>
                        </div>
                        {contribution.received_date && (
                          <div>
                            <p className="text-gray-500">Received On</p>
                            <p className="font-medium">
                              {format(new Date(contribution.received_date), 'd MMM yyyy')}
                            </p>
                          </div>
                        )}
                        {contribution.notes && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Notes</p>
                            <p className="font-medium">{contribution.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Contribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <Gift className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Contribution</h3>
                  <p className="text-sm text-gray-500">Track family contributions</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Contributor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contributor Name *
                </label>
                <input
                  type="text"
                  value={formData.contributorName}
                  onChange={(e) => setFormData(f => ({ ...f, contributorName: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g., Sharma Family, Priya Aunty"
                  required
                />
              </div>

              {/* Side Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Side *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bride', 'groom', 'other'] as const).map(side => {
                    const config = SIDE_CONFIG[side];
                    const Icon = config.icon;
                    return (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, contributorSide: side }))}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                          formData.contributorSide === side
                            ? cn(config.bgClass, config.borderClass)
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          formData.contributorSide === side
                            ? config.textClass
                            : "text-gray-400"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          formData.contributorSide === side
                            ? config.textClass
                            : "text-gray-600"
                        )}>
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Relation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relation
                </label>
                <select
                  value={formData.contributorRelation}
                  onChange={(e) => setFormData(f => ({ ...f, contributorRelation: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Select relation</option>
                  {RELATION_OPTIONS.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rs) *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                    className="w-full rounded-lg border pl-10 pr-3 py-2 text-sm"
                    placeholder="50000"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTRIBUTION_TYPES.map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, contributionType: type.value as any }))}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                          formData.contributionType === type.value
                            ? "border-rose-300 bg-rose-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <TypeIcon className={cn(
                          "h-5 w-5",
                          formData.contributionType === type.value
                            ? "text-rose-600"
                            : "text-gray-400"
                        )} />
                        <span className="text-xs font-medium text-center">
                          {type.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  For Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {([
                    { value: 'pledged', label: 'Pledged', icon: SparklesIcon },
                    { value: 'received', label: 'Received', icon: Check },
                    { value: 'pending', label: 'Pending', icon: Clock },
                  ] as const).map(status => {
                    const StatusIcon = status.icon;
                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, status: status.value }))}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                          formData.status === status.value
                            ? "border-rose-300 bg-rose-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <StatusIcon className={cn(
                          "h-4 w-4",
                          formData.status === status.value ? "text-rose-600" : "text-gray-400"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          formData.status === status.value ? "text-rose-700" : "text-gray-600"
                        )}>
                          {status.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
                >
                  {isPending ? 'Adding...' : 'Add Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
