import { Redirect, Stack } from 'expo-router';

import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';

export default function AuthLayout() {
  const { status, isPasswordRecovery } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Si el registro/login ya dejó la sesión activa mientras estábamos en (auth),
  // salimos hacia onboarding o tabs — sin esto, la usuaria queda varada en login/register.
  // Excepción: una sesión de recuperación de contraseña también queda "signedIn"
  // (exchangeCodeForSession en reset-password.tsx) pero la usuaria todavía no
  // fijó la nueva contraseña — no la sacamos de (auth) hasta que lo haga.
  if (status === 'signedIn' && !isPasswordRecovery) {
    if (profileLoading) return null;
    if (!profile?.onboarding_completed_at) {
      return <Redirect href="/(onboarding)/welcome" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
