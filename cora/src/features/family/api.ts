import { supabase } from '@/lib/supabase';
import type { Database } from '@/shared/types/database.types';

type ShareScope = Database['public']['Enums']['share_scope'];

const CIRCLE_FIELDS = '*, family_share_grants(*)';

export async function fetchMyCircle(ownerId: string) {
  const { data, error } = await supabase
    .from('family_circle_members')
    .select(CIRCLE_FIELDS)
    .eq('owner_id', ownerId)
    .neq('status', 'revoked')
    .order('invited_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchSharedWithMe(viewerId: string) {
  const { data, error } = await supabase
    .from('family_circle_members')
    .select(CIRCLE_FIELDS)
    .eq('member_user_id', viewerId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createInvite(input: {
  ownerId: string;
  ownerDisplayName: string;
  inviteEmail: string;
  relationship: string;
}) {
  const { data, error } = await supabase
    .from('family_circle_members')
    .insert({
      owner_id: input.ownerId,
      owner_display_name: input.ownerDisplayName,
      invite_email: input.inviteEmail,
      relationship: input.relationship,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setGrant(input: { membershipId: string; scope: ShareScope; enabled: boolean }) {
  if (input.enabled) {
    const { error } = await supabase
      .from('family_share_grants')
      .upsert(
        { membership_id: input.membershipId, scope: input.scope, revoked_at: null },
        { onConflict: 'membership_id,scope' }
      );
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('family_share_grants')
    .update({ revoked_at: new Date().toISOString() })
    .eq('membership_id', input.membershipId)
    .eq('scope', input.scope);
  if (error) throw error;
}

export async function revokeMembership(membershipId: string) {
  const { error } = await supabase
    .from('family_circle_members')
    .update({ status: 'revoked' })
    .eq('id', membershipId);
  if (error) throw error;
}

export async function leaveCircle(membershipId: string) {
  const { error } = await supabase.rpc('leave_family_circle', { p_membership_id: membershipId });
  if (error) throw error;
}

export async function acceptInvite(membershipId: string) {
  const { data, error } = await supabase.rpc('accept_family_invite', {
    p_membership_id: membershipId,
  });
  if (error) throw error;
  return data;
}

export async function fetchFamilyMoodSummary(ownerId: string) {
  const { data, error } = await supabase.rpc('get_family_mood_summary', {
    p_owner_id: ownerId,
    p_days: 30,
  });
  if (error) throw error;
  return data;
}
