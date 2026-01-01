import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { WeddingOnboardingWizard } from '@/components/wedding/onboarding-wizard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewWeddingPage() {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white py-8 px-4">
      {/* Back Link */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event Selection
        </Link>
      </div>

      {/* Wizard */}
      <WeddingOnboardingWizard
        organizationId={currentOrg.id}
        organizationSlug={currentOrg.slug}
      />
    </div>
  );
}
