import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';
import { err, ok, type Result } from '@/shared/utils/result';

import { GOOGLE_OAUTH_REDIRECT_URL } from './constants';
import type { LoginInput, RegisterInput } from './schema';

// Requerido por expo-web-browser para que la sesión de auth se resuelva bien
// al volver del navegador — debe correr una vez a nivel de módulo.
WebBrowser.maybeCompleteAuthSession();

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

export async function signInWithGoogle(): Promise<Result<null, string>> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: GOOGLE_OAUTH_REDIRECT_URL, skipBrowserRedirect: true },
  });
  if (error || !data.url) return err(toFriendlyMessage(error?.message ?? ''));

  const result = await WebBrowser.openAuthSessionAsync(data.url, GOOGLE_OAUTH_REDIRECT_URL);
  if (result.type !== 'success') return err('Inicio de sesión cancelado.');

  // supabase-js usa flujo PKCE por defecto (sin flowType explícito en
  // createClient): el redirect trae un ?code=... que hay que canjear, no
  // tokens sueltos en el fragmento de la URL.
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
  if (exchangeError) return err(toFriendlyMessage(exchangeError.message));

  return ok(null);
}
