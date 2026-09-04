import { supabase } from '@/lib/supabase';
import type { Tables } from '@/shared/types/database.types';

export type MedicalBackground = Tables<'medical_background'>;
export type BloodType = NonNullable<MedicalBackground['blood_type']>;

export type MedicalBackgroundInput = {
  allergies: string | null;
  familyHistory: string | null;
  chronicConditions: string | null;
  currentMedications: string | null;
  bloodType: BloodType | null;
};

export async function fetchMedicalBackground(userId: string): Promise<MedicalBackground | null> {
  const { data, error } = await supabase
    .from('medical_background')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// upsert directo — sin RPC porque no necesita historial ni gamificación,
// mismo criterio que updateAvatar en src/features/onboarding/api.ts.
export async function saveMedicalBackground(
  userId: string,
  input: MedicalBackgroundInput
): Promise<void> {
  const { error } = await supabase.from('medical_background').upsert({
    user_id: userId,
    allergies: input.allergies,
    family_history: input.familyHistory,
    chronic_conditions: input.chronicConditions,
    current_medications: input.currentMedications,
    blood_type: input.bloodType,
  });

  if (error) throw error;
}
