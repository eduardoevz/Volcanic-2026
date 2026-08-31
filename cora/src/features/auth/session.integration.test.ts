const authStateHandlers: ((event: string, session: unknown) => void)[] = [];

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn((handler: (event: string, session: unknown) => void) => {
        authStateHandlers.push(handler);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      signOut: jest.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';
import { initSessionListener, useSessionStore } from '@/store/sessionStore';

// initSessionListener usa un flag de módulo (`listenerStarted`) para evitar
// registrar el listener más de una vez — por eso este archivo hace UNA sola
// llamada a initSessionListener() y prueba el flujo completo en un único
// test secuencial en vez de resetear entre tests.
describe('recuperación de sesión al reabrir la app', () => {
  it('restaura la sesión guardada y luego reacciona a cambios de auth (login, logout, token expirado)', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'saved-token', user: { id: 'u1' } } },
    });

    initSessionListener();
    await Promise.resolve();
    await Promise.resolve();

    expect(useSessionStore.getState().status).toBe('signedIn');
    expect(useSessionStore.getState().session?.access_token).toBe('saved-token');

    // Logout — el listener de Supabase notifica SIGNED_OUT
    const handler = authStateHandlers[0];
    handler('SIGNED_OUT', null);
    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(useSessionStore.getState().session).toBeNull();

    // Vuelve a iniciar sesión
    handler('SIGNED_IN', { access_token: 'new-token', user: { id: 'u1' } });
    expect(useSessionStore.getState().status).toBe('signedIn');

    // Token expirado / sesión inválida — Supabase emite sesión null sin evento SIGNED_OUT explícito en algunos casos
    handler('TOKEN_REFRESHED', null);
    expect(useSessionStore.getState().status).toBe('signedOut');
  });
});
