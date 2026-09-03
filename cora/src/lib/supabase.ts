import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';

import { LargeSecureStore } from '@/lib/secureStorage';
import type { Database } from '@/shared/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore('sb-auth'),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Sin esto GoTrue responde con tokens en el fragmento de la URL
    // (#access_token=...) en vez de un ?code=... — signInWithGoogle
    // (src/features/auth/api.ts) espera PKCE y usa exchangeCodeForSession.
    flowType: 'pkce',
  },
});

// Supabase no puede refrescar el token mientras la app está en background;
// este listener evita llamadas de refresh innecesarias y las retoma al volver a foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
