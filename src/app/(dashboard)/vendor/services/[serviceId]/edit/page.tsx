import { getVendorByUserId, updateVendorService } from '@/actions/vendors';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ServiceForm } from '@/components/features/service-form';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
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

  const { serviceId } = await params;

  // Fetch the service
  const { data: service, error } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('id', serviceId)
    .eq('vendor_id', vendor.id)
    .single();

  if (error || !service) {
    redirect('/vendor/services');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/vendor/services"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Services
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Edit Service</h2>
        <p className="text-muted-foreground mt-2">
          Update your service details
        </p>
      </div>

      <ServiceForm vendorId={vendor.id} service={service} action={updateVendorService} />
    </div>
  );
}
