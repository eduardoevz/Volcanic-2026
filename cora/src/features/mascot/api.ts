import { supabase } from '@/lib/supabase';

export async function fetchMascotState(userId: string) {
  const { data, error } = await supabase
    .from('mascot_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRecentMascotEvents(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('mascot_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
