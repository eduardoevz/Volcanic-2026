import { Redirect, Stack } from 'expo-router';

import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';

export default function OnboardingLayout() {
  const { status } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'loading' || profileLoading) {
    return null;
  }

  // Ya completó el onboarding — no tiene sentido volver a mostrárselo.
  if (profile?.onboarding_completed_at) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="life-stage" />
      <Stack.Screen name="avatar" />
      <Stack.Screen name="mascot" />
      <Stack.Screen name="consent" />
    </Stack>
  );
}
