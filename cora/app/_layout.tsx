import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/lib/i18n';

import { asyncStoragePersister, queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="dev/kitchen-sink" options={{ headerShown: true, title: 'Kitchen Sink' }} />
          </Stack>
          <StatusBar style="auto" />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
