import { supabase } from '@/lib/supabase';
import { setLifeStage } from '@/features/onboarding/api';
import type { LifeStage } from '@/shared/constants/lifeStages';

export async function fetchActivePregnancy(userId: string) {
  const { data, error } = await supabase
    .from('pregnancies')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPregnancy(input: {
  userId: string;
  lmpDate: string;
  dueDate: string;
}) {
  const { data, error } = await supabase
    .from('pregnancies')
    .insert({ user_id: input.userId, lmp_date: input.lmpDate, due_date: input.dueDate })
    .select()
    .single();

  if (error) throw error;
  await setLifeStage('embarazo');
  return data;
}

export async function updatePregnancyNotes(id: string, notes: string) {
  const { error } = await supabase.from('pregnancies').update({ notes }).eq('id', id);
  if (error) throw error;
}

export async function endPregnancy(
  id: string,
  status: 'completed' | 'ended',
  nextLifeStage: LifeStage
) {
  const { error } = await supabase
    .from('pregnancies')
    .update({ status, ended_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  await setLifeStage(nextLifeStage);
}
