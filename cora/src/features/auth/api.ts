import { supabase } from '@/lib/supabase';
import { err, ok, type Result } from '@/shared/utils/result';

import type { LoginInput, RegisterInput } from './schema';

function toFriendlyMessage(rawMessage: string): string {
  const known: Record<string, string> = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User already registered': 'Ese correo ya está registrado.',
    'Email not confirmed': 'Todavía no confirmaste tu correo.',
    'Password should be at least 6 characters': 'La contraseña es muy corta.',
  };

  return known[rawMessage] ?? 'Ocurrió un error. Intentá de nuevo.';
}

export async function signIn({ email, password }: LoginInput): Promise<Result<null, string>> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return err(toFriendlyMessage(error.message));
  return ok(null);
}

export async function signUp({ email, password }: RegisterInput): Promise<Result<null, string>> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return err(toFriendlyMessage(error.message));
  return ok(null);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
