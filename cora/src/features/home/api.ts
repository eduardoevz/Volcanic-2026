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
