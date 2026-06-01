import { getUserProfile } from '@/actions/auth';
import { getUserOrganizations } from '@/actions/organizations';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/features/settings-form';

export default async function SettingsPage() {
  const profile = await getUserProfile();
  const organizations = await getUserOrganizations();

  if (!profile) {
    redirect('/login');
  }

  if (organizations.length === 0) {
    redirect('/organizations/new');
  }

  const currentOrg = organizations[0];

  return (
    <SettingsForm
      user={{
        email: profile.email || '',
        fullName: profile.fullName,
        phone: profile.phone,
      }}
      organization={{
        id: currentOrg.id,
        name: currentOrg.name,
      }}
    />
  );
}
