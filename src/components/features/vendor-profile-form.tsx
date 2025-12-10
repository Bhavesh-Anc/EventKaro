'use client';

import { useState, useTransition } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VendorProfileFormProps {
  vendor: any;
  businessTypes: { value: string; label: string }[];
  priceRanges: { value: string; label: string; description: string }[];
  updateAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export function VendorProfileForm({
  vendor,
  businessTypes,
  priceRanges,
  updateAction,
}: VendorProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="vendor_id" value={vendor.id} />

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-green-800 font-medium">✓ Profile updated successfully!</p>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Business Information */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Business Information</h3>

        <div>
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            name="business_name"
            type="text"
            required
            disabled={isPending}
            defaultValue={vendor.business_name}
            placeholder="e.g., Taj Catering Services"
          />
        </div>

        <div>
          <Label htmlFor="business_type">Business Type</Label>
          <select
            id="business_type"
            name="business_type"
            disabled
            defaultValue={vendor.business_type}
            className="w-full rounded-md border px-3 py-2 text-sm bg-muted cursor-not-allowed"
          >
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Business type cannot be changed. Contact support if needed.
          </p>
        </div>

        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            name="tagline"
            type="text"
            disabled={isPending}
            defaultValue={vendor.tagline || ''}
            placeholder="A short, catchy description of your business"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This appears on your vendor card (max 100 characters)
          </p>
        </div>

        <div>
          <Label htmlFor="description">Business Description *</Label>
          <textarea
            id="description"
            name="description"
            required
            disabled={isPending}
            rows={6}
            defaultValue={vendor.description || ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tell potential clients about your business, experience, and what makes you unique..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            This appears on your profile page
          </p>
        </div>

        <div>
          <Label htmlFor="price_range">Price Range</Label>
          <select
            id="price_range"
            name="price_range"
            disabled={isPending}
            defaultValue={vendor.price_range || ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select price range...</option>
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label} - {range.description}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="years_in_business">Years in Business</Label>
            <Input
              id="years_in_business"
              name="years_in_business"
              type="number"
              min="0"
              disabled={isPending}
              defaultValue={vendor.years_in_business || ''}
              placeholder="5"
            />
          </div>
          <div>
            <Label htmlFor="team_size">Team Size</Label>
            <Input
              id="team_size"
              name="team_size"
              type="number"
              min="1"
              disabled={isPending}
              defaultValue={vendor.team_size || ''}
              placeholder="10"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Contact Information</h3>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            disabled={isPending}
            defaultValue={vendor.phone}
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            type="tel"
            disabled={isPending}
            defaultValue={vendor.whatsapp_number || ''}
            placeholder="+91 98765 43210"
          />
          <p className="text-xs text-muted-foreground mt-1">
            If different from phone number
          </p>
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            disabled={isPending}
            defaultValue={vendor.website || ''}
            placeholder="https://www.yourbusiness.com"
          />
        </div>

        <div>
          <Label htmlFor="address">Business Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            disabled={isPending}
            defaultValue={vendor.address || ''}
            placeholder="Street address, building name, etc."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              disabled={isPending}
              defaultValue={vendor.city}
              placeholder="Mumbai"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              type="text"
              disabled={isPending}
              defaultValue={vendor.state || ''}
              placeholder="Maharashtra"
            />
          </div>
          <div>
            <Label htmlFor="pincode">PIN Code</Label>
            <Input
              id="pincode"
              name="pincode"
              type="text"
              disabled={isPending}
              defaultValue={vendor.pincode || ''}
              placeholder="400001"
              maxLength={6}
            />
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Business Details</h3>

        <div>
          <Label htmlFor="gst_number">GST Number</Label>
          <Input
            id="gst_number"
            name="gst_number"
            type="text"
            disabled={isPending}
            defaultValue={vendor.gst_number || ''}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
          />
          <p className="text-xs text-muted-foreground mt-1">
            For issuing GST invoices to clients
          </p>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Social Media (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground">
          Social media integration will be available in the next update. You'll be able to add links to your Instagram, Facebook, and YouTube profiles.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
}
