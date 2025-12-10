import { getVendorByUserId, getVendorServices } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ServicesList } from '@/components/features/services-list';

export default async function VendorServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const vendor = await getVendorByUserId(user.id);

  if (!vendor) {
    redirect('/vendors/register');
  }

  const services = await getVendorServices(vendor.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/vendor/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manage Services</h2>
            <p className="text-muted-foreground">
              Add and manage the individual services you offer
            </p>
          </div>
          <Link
            href="/vendor/services/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add New Service
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">About Services</h3>
        <p className="text-sm text-blue-800">
          Services are individual offerings with specific pricing. For example, if you're a photographer,
          you might offer "4-Hour Photo Session", "Full-Day Coverage", or "Pre-Wedding Shoot" as separate
          services. Clients can request quotes for specific services.
        </p>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first service to showcase what you offer to clients
          </p>
          <Link
            href="/vendor/services/new"
            className="inline-flex rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add Your First Service
          </Link>
        </div>
      ) : (
        <ServicesList services={services} vendorId={vendor.id} />
      )}
    </div>
  );
}
