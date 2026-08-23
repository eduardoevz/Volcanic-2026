import { Tabs } from 'expo-router';

import { colors } from '@/ui/theme/tokens';

export default function TabsLayout() {
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
