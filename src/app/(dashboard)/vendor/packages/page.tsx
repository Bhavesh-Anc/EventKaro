import { getVendorByUserId, getVendorPackages } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PackagesList } from '@/components/features/packages-list';

export default async function VendorPackagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const vendor = await getVendorByUserId(user.id);

  if (!vendor) {
    redirect('/vendors/register');
  }

  const packages = await getVendorPackages(vendor.id);

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
            <h2 className="text-3xl font-bold tracking-tight">Manage Packages</h2>
            <p className="text-muted-foreground">
              Create bundled service packages with special pricing
            </p>
          </div>
          <Link
            href="/vendor/packages/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add New Package
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">About Packages</h3>
        <p className="text-sm text-blue-800">
          Packages are bundled offerings that combine multiple services or features at a special price.
          For example, a "Wedding Essential Package" might include photography, videography, and photo album
          at a discounted rate. You can mark one package as "Popular" to highlight it to clients.
        </p>
      </div>

      {/* Packages List */}
      {packages.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold mb-2">No Packages Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first package to offer bundled services to clients
          </p>
          <Link
            href="/vendor/packages/new"
            className="inline-flex rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add Your First Package
          </Link>
        </div>
      ) : (
        <PackagesList packages={packages} vendorId={vendor.id} />
      )}
    </div>
  );
}
