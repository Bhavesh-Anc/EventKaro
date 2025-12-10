import { getVendorByUserId, updateVendorProfile } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { VendorProfileForm } from '@/components/features/vendor-profile-form';

export default async function VendorProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const vendor = await getVendorByUserId(user.id);

  if (!vendor) {
    redirect('/vendors/register');
  }

  const businessTypes = [
    { value: 'caterer', label: 'Caterer' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'decorator', label: 'Decorator / Event Designer' },
    { value: 'venue', label: 'Venue' },
    { value: 'dj', label: 'DJ / Music' },
    { value: 'makeup_artist', label: 'Makeup Artist' },
    { value: 'mehendi_artist', label: 'Mehendi Artist' },
    { value: 'florist', label: 'Florist' },
    { value: 'cake_designer', label: 'Cake Designer / Baker' },
    { value: 'wedding_planner', label: 'Wedding Planner / Event Coordinator' },
    { value: 'sound_lighting', label: 'Sound & Lighting' },
    { value: 'entertainment', label: 'Entertainment / Performers' },
    { value: 'transport', label: 'Transport / Travel Services' },
    { value: 'other', label: 'Other Services' },
  ];

  const priceRanges = [
    { value: 'budget', label: 'Budget (₹)', description: 'Affordable options for cost-conscious clients' },
    { value: 'moderate', label: 'Moderate (₹₹)', description: 'Good value for mid-range budgets' },
    { value: 'premium', label: 'Premium (₹₹₹)', description: 'High-quality service with premium pricing' },
    { value: 'luxury', label: 'Luxury (₹₹₹₹)', description: 'Exclusive, top-tier luxury services' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/vendor/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Profile</h2>
            <p className="text-muted-foreground">
              Update your business information and settings
            </p>
          </div>
          <Link
            href={`/vendors/${vendor.id}`}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            View Public Profile
          </Link>
        </div>
      </div>

      {/* Profile Status */}
      <div className="rounded-lg border p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Profile Status</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                {vendor.is_verified ? (
                  <>
                    <span className="text-green-600">✓</span>
                    <span className="text-green-700 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <span className="text-yellow-600">⚠</span>
                    <span className="text-yellow-700 font-medium">Not Verified</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {vendor.is_featured ? (
                  <>
                    <span className="text-purple-600">★</span>
                    <span className="text-purple-700 font-medium">Featured</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">☆</span>
                    <span className="text-muted-foreground">Not Featured</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {vendor.is_active ? (
                  <>
                    <span className="text-blue-600">●</span>
                    <span className="text-blue-700 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-600">●</span>
                    <span className="text-red-700 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {!vendor.is_verified && (
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Apply for Verification
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <VendorProfileForm
        vendor={vendor}
        businessTypes={businessTypes}
        priceRanges={priceRanges}
        updateAction={updateVendorProfile}
      />
    </div>
  );
}
