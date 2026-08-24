import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/shared/hooks/useSession';

export default function AuthLayout() {
  const { status } = useSession();

  // Si el registro/login ya dejó la sesión activa mientras estábamos en (auth),
  // salimos hacia (tabs) — sin esto, la usuaria queda varada en login/register.
  if (status === 'signedIn') {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
