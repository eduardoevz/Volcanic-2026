import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MascotEvolutionOverlay } from '@/features/mascot';
import { useRegisterPushToken } from '@/features/notifications';
import { registerNotificationHandler } from '@/features/reminders';
import { restoreSavedLanguage } from '@/lib/i18n';
import { asyncStoragePersister, configureOnlineManager, queryClient } from '@/lib/queryClient';
import { initSessionListener } from '@/store/sessionStore';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { ThemeProvider, useTheme } from '@/ui/theme/ThemeContext';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigation />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function RootNavigation() {
  const { t } = useTranslation('common');
  const { colors, scheme } = useTheme();

  useEffect(() => {
    initSessionListener();
    configureOnlineManager();
    registerNotificationHandler();
    restoreSavedLanguage();
  }, []);

  useRegisterPushToken();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        dehydrateOptions: {
          shouldDehydrateMutation: () => true,
        },
      }}
      onSuccess={() => {
        // Retoma mutaciones que quedaron pausadas (sin red) antes de que
        // se cerrara la app la última vez.
        queryClient.resumePausedMutations();
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.charcoal,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="log/[date]"
          options={{ headerShown: true, presentation: 'modal', title: t('nav.dailyLog') }}
        />
        <Stack.Screen
          name="article/[slug]"
          options={{ headerShown: true, title: t('nav.article') }}
        />
        <Stack.Screen name="mascot" options={{ headerShown: true, title: t('nav.mascot') }} />
        <Stack.Screen
          name="summary/index"
          options={{ headerShown: true, title: t('nav.summary') }}
        />
        <Stack.Screen name="reminders" options={{ headerShown: true, title: t('nav.reminders') }} />
        <Stack.Screen name="stats" options={{ headerShown: true, title: t('nav.stats') }} />
        <Stack.Screen
          name="directory/index"
          options={{ headerShown: true, title: t('nav.directory') }}
        />
        <Stack.Screen
          name="directory/specialists"
          options={{ headerShown: true, title: t('nav.specialists') }}
        />
        <Stack.Screen name="family/index" options={{ headerShown: true, title: t('nav.family') }} />
        <Stack.Screen
          name="family/invite"
          options={{ headerShown: true, title: t('nav.familyInvite') }}
        />
        <Stack.Screen
          name="family/accept"
          options={{ headerShown: true, title: t('nav.familyAccept') }}
        />
        <Stack.Screen
          name="pregnancy/index"
          options={{ headerShown: true, title: t('nav.pregnancy') }}
        />
        <Stack.Screen
          name="appointments"
          options={{ headerShown: true, title: t('nav.appointments') }}
        />
        <Stack.Screen
          name="dev/kitchen-sink"
          options={{ headerShown: true, title: 'Kitchen Sink' }}
        />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <MascotEvolutionOverlay />
    </PersistQueryClientProvider>
  );
}
