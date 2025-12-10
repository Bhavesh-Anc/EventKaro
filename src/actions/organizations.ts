'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const slug = generateSlug(formData.get('slug') as string || name);
  const gstin = formData.get('gstin') as string || null;
  const pan = formData.get('pan') as string || null;

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      gstin,
      pan,
      plan: 'free',
    })
    .select()
    .single();

  if (orgError) {
    return { error: orgError.message };
  }

  // Add user as owner
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function getUserOrganizations() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organization:organizations (
        id,
        name,
        slug,
        logo_url,
        plan
      )
    `)
    .eq('user_id', user.id);

  if (error) return [];

  return data.map(item => ({
    ...item.organization,
    role: item.role,
  }));
}

export async function getOrganization(orgId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error) return null;
  return data;
}
