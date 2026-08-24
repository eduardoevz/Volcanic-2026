import { Redirect, Tabs } from 'expo-router';

import { useSession } from '@/shared/hooks/useSession';
import { colors } from '@/ui/theme/tokens';

export default function TabsLayout() {
  const { status } = useSession();

  // Protege cualquier ruta de (tabs) contra acceso directo sin sesión —
  // app/index.tsx solo cubre la resolución inicial en "/".
  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'loading') {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pitahaya,
        tabBarInactiveTintColor: colors.charcoalMuted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendario' }} />
      <Tabs.Screen name="library" options={{ title: 'Biblioteca' }} />
      <Tabs.Screen name="assistant" options={{ title: 'Cora' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
