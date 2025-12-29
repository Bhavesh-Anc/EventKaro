'use client';

import Link from 'next/link';
import { Phone, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: 'confirmed' | 'pending' | 'declined';
  phone?: string;
  email?: string;
}

interface Props {
  vendors: Vendor[];
  eventId?: string;
}

const STATUS_CONFIG = {
  confirmed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Confirmed',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Pending',
  },
  declined: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Declined',
  },
};

export function WeddingVendorList({ vendors, eventId }: Props) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vendors</h3>
        <Link
          href="/vendors"
          className="text-sm font-medium text-rose-700 hover:text-rose-800"
        >
          View All →
        </Link>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏢</div>
          <p className="text-sm text-gray-500">No vendors added yet</p>
          <Link
            href="/vendors"
            className="mt-3 inline-block text-sm font-medium text-rose-700 hover:text-rose-800"
          >
            Browse Vendors →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor) => {
            const statusConfig = STATUS_CONFIG[vendor.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={vendor.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-rose-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{vendor.name}</h4>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.color}`} />
                    <span className={`text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-700 transition-all text-sm font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-700 transition-all text-sm font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
