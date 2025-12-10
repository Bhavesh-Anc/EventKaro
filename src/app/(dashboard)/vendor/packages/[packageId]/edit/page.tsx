import { getVendorByUserId, updateVendorPackage } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PackageForm } from '@/components/features/package-form';

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const vendor = await getVendorByUserId(user.id);

  if (!vendor) {
    redirect('/vendors/register');
  }

  const { packageId } = await params;

  // Fetch the package
  const { data: pkg, error } = await supabase
    .from('vendor_packages')
    .select('*')
    .eq('id', packageId)
    .eq('vendor_id', vendor.id)
    .single();

  if (error || !pkg) {
    redirect('/vendor/packages');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/vendor/packages"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Packages
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Edit Package</h2>
        <p className="text-muted-foreground mt-2">
          Update your package details
        </p>
      </div>

      <PackageForm vendorId={vendor.id} package={pkg} action={updateVendorPackage} />
    </div>
  );
}
