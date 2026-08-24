import { supabase } from '@/lib/supabase';

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, avatars(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAiShareHealthContext(userId: string, value: boolean) {
  const { error } = await supabase
    .from('user_preferences')
    .update({ ai_share_health_context: value })
    .eq('user_id', userId);

  if (error) throw error;
}
