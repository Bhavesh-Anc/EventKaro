'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
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
    console.error('Error creating organization:', orgError);
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
    console.error('Error adding member:', memberError);
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
      organizations (
        id,
        name,
        slug,
        logo_url,
        plan
      )
    `)
    .eq('user_id', user.id);

  if (error) return [];

  return data
    .filter(item => item.organizations)
    .map(item => ({
      ...(item.organizations as any),
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

export async function updateOrganization(orgId: string, params: { name: string }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check user is a member of this org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'Not authorized to update this organization' };
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      name: params.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}
