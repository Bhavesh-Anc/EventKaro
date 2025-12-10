import { createVendorProfile, getVendorByUserId } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function VendorRegistrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user already has a vendor profile
  const existingVendor = await getVendorByUserId(user.id);
  if (existingVendor) {
    redirect(`/vendor/dashboard`);
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Become a Vendor</h2>
        <p className="text-muted-foreground mt-2">
          Join EventKaro's marketplace and connect with thousands of event organizers
        </p>
      </div>

      {/* Benefits Section */}
      <div className="rounded-lg border p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <h3 className="font-semibold text-lg mb-3">Why Join EventKaro?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <h4 className="font-medium">Grow Your Business</h4>
              <p className="text-sm text-muted-foreground">
                Reach thousands of event organizers actively looking for vendors
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">💼</span>
            <div>
              <h4 className="font-medium">Manage Bookings</h4>
              <p className="text-sm text-muted-foreground">
                Handle quotes, bookings, and payments in one place
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <h4 className="font-medium">Build Reputation</h4>
              <p className="text-sm text-muted-foreground">
                Collect reviews and ratings to build trust
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-medium">Free Listing</h4>
              <p className="text-sm text-muted-foreground">
                No upfront fees, only pay when you get business
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form action={createVendorProfile} className="space-y-8">
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
              placeholder="e.g., Taj Catering Services"
            />
          </div>

          <div>
            <Label htmlFor="business_type">Business Type *</Label>
            <select
              id="business_type"
              name="business_type"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select your business type...</option>
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              type="text"
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
              rows={5}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell potential clients about your business, experience, and what makes you unique..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              This appears on your profile page
            </p>
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
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Street address, building name, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                placeholder="Mumbai"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                type="text"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pincode">PIN Code</Label>
            <Input
              id="pincode"
              name="pincode"
              type="text"
              placeholder="400001"
              maxLength={6}
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold">Business Details (Optional)</h3>

          <div>
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              id="gst_number"
              name="gst_number"
              type="text"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground mt-1">
              For issuing GST invoices to clients
            </p>
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="space-y-4">
          <div className="rounded-lg border p-6 bg-muted/50">
            <h3 className="font-semibold mb-2">Next Steps</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Your profile will be created immediately</li>
              <li>✓ You can add services, packages, and photos from your dashboard</li>
              <li>✓ Apply for verification to build trust with clients</li>
              <li>✓ Start receiving quote requests within 24 hours</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create Vendor Profile
            </button>
          </div>
        </div>
      </form>

      {/* FAQ Section */}
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Is there a registration fee?</h4>
            <p className="text-sm text-muted-foreground">
              No! Listing your business on EventKaro is completely free. We only charge a small commission on confirmed bookings.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">How do I get verified?</h4>
            <p className="text-sm text-muted-foreground">
              After creating your profile, you can apply for verification by submitting business documents. Verified vendors get a badge and higher visibility.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-1">Can I edit my profile later?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can update your profile, services, pricing, and photos anytime from your vendor dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
