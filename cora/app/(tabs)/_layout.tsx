import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import {
  AssistantTabIcon,
  CalendarTabIcon,
  HomeTabIcon,
  LibraryTabIcon,
  ProfileTabIcon,
} from '@/ui/components/icons/TabIcons';
import { useTheme } from '@/ui/theme/ThemeContext';

export default function TabsLayout() {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
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
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('nav.home'), tabBarIcon: ({ color }) => <HomeTabIcon color={color as string} /> }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('nav.calendar'),
          tabBarIcon: ({ color }) => <CalendarTabIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('nav.library'),
          tabBarIcon: ({ color }) => <LibraryTabIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t('nav.assistant'),
          tabBarIcon: ({ color }) => <AssistantTabIcon color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color }) => <ProfileTabIcon color={color as string} />,
        }}
      />
    </Tabs>
  );
}
