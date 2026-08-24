import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/lib/i18n';

import { asyncStoragePersister, configureOnlineManager, queryClient } from '@/lib/queryClient';
import { initSessionListener } from '@/store/sessionStore';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => {
    initSessionListener();
    configureOnlineManager();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
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
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="log/[date]"
              options={{ headerShown: true, presentation: 'modal', title: 'Registro diario' }}
            />
            <Stack.Screen
              name="article/[slug]"
              options={{ headerShown: true, title: 'Artículo' }}
            />
            <Stack.Screen name="dev/kitchen-sink" options={{ headerShown: true, title: 'Kitchen Sink' }} />
          </Stack>
          <StatusBar style="auto" />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
