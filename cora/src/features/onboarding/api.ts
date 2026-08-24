import { supabase } from '@/lib/supabase';
import type { LifeStage } from '@/shared/constants/lifeStages';

export const CONSENT_VERSION = '2026-08-24';

export async function setLifeStage(stage: LifeStage) {
  const { error } = await supabase.rpc('set_life_stage', { new_stage: stage });
  if (error) throw error;
}

export async function updateAvatar(avatarId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_id: avatarId })
    .eq('id', userData.user.id);

  if (error) throw error;
}

export async function completeOnboarding(options: {
  notificationsEnabled: boolean;
  aiShareHealthContext: boolean;
}) {
  const { error } = await supabase.rpc('complete_onboarding', {
    p_notifications_enabled: options.notificationsEnabled,
    p_ai_share_health_context: options.aiShareHealthContext,
    p_consent_version: CONSENT_VERSION,
  });
  if (error) throw error;
}
