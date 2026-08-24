import { supabase } from '@/lib/supabase';

export async function fetchAvatars() {
  const { data, error } = await supabase
    .from('avatars')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}
