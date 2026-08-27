import { useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';

import { ResetPasswordForm } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type ExchangeStatus = 'pending' | 'success' | 'error';

export default function ResetPassword() {
  const { setPasswordRecovery } = useSession();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [status, setStatus] = useState<ExchangeStatus>(code ? 'pending' : 'error');

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    // Mismo intercambio PKCE que signInWithGoogle() en features/auth/api.ts,
    // pero pasando el código solo (no la URL completa): exchangeCodeForSession
    // en esta versión de supabase-js espera el auth code crudo, no una URL.
    setPasswordRecovery(true);
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setPasswordRecovery(false);
        setStatus('error');
        return;
      }
      setStatus('success');
    });

    return () => {
      cancelled = true;
    };
  }, [code, setPasswordRecovery]);

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Restablecer contraseña
      </Text>

      {status === 'pending' ? <Banner message="Verificando el enlace..." tone="info" /> : null}

      {status === 'error' ? (
        <>
          <Banner
            message="Este enlace ya no es válido o expiró. Pedí uno nuevo."
            tone="danger"
          />
          <Link href="/(auth)/forgot-password" asChild>
            <Button
              label="Pedir un nuevo enlace"
              variant="ghost"
              onPress={() => {}}
              style={{ marginTop: spacing.sm }}
            />
          </Link>
        </>
      ) : null}

      {status === 'success' ? <ResetPasswordForm /> : null}
    </Screen>
  );
}
