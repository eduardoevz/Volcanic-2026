import { supabase } from '@/lib/supabase';

import type { SummaryPayload } from './buildSummary';

export async function fetchMedicalSummaries(userId: string) {
  const { data, error } = await supabase
    .from('medical_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function insertMedicalSummary(
  userId: string,
  periodStart: string,
  periodEnd: string,
  payload: SummaryPayload
) {
  const { data, error } = await supabase
    .from('medical_summaries')
    .insert({
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      payload,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
