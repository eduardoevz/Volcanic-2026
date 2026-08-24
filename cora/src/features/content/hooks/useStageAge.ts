import { ageFromBirthYear } from '@/features/content/api';
import { useProfile } from '@/features/profile';

/** Etapa + edad derivadas del perfil, listas para filtrar contenido. */
export function useStageAge() {
  const { data: profile, isLoading } = useProfile();
  const stage = profile?.life_stage ?? null;
  const age = ageFromBirthYear(profile?.birth_year);

  return { stage, age, isLoading };
}
