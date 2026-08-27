import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import { colors } from '@/ui/theme/tokens';

export default function TabsLayout() {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Protege cualquier ruta de (tabs) contra acceso directo sin sesión o sin
  // onboarding completo — app/index.tsx solo cubre la resolución inicial en "/".
  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'loading' || profileLoading) {
    return null;
  }

  if (!profile?.onboarding_completed_at) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pitahaya,
        tabBarInactiveTintColor: colors.charcoalMuted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="calendar" options={{ title: t('nav.calendar') }} />
      <Tabs.Screen name="library" options={{ title: t('nav.library') }} />
      <Tabs.Screen name="assistant" options={{ title: t('nav.assistant') }} />
      <Tabs.Screen name="profile" options={{ title: t('nav.profile') }} />
    </Tabs>
  );
}
