import { Link } from 'expo-router';

import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Index() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Cora
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.lg }}>
        Pantalla de entrada temporal (Fase 1). El gate real de sesión llega en la Fase 2 —
        por ahora, navegación manual para verificar los 3 grupos de rutas.
      </Text>

      <Link href="/(auth)/login" asChild>
        <Button label="Ir a (auth)/login" onPress={() => {}} style={{ marginBottom: spacing.sm }} />
      </Link>
      <Link href="/(onboarding)/welcome" asChild>
        <Button
          label="Ir a (onboarding)/welcome"
          variant="secondary"
          onPress={() => {}}
          style={{ marginBottom: spacing.sm }}
        />
      </Link>
      <Link href="/(tabs)/home" asChild>
        <Button
          label="Ir a (tabs)/home"
          variant="secondary"
          onPress={() => {}}
          style={{ marginBottom: spacing.sm }}
        />
      </Link>
      <Link href="/dev/kitchen-sink" asChild>
        <Button label="Ver Kitchen Sink" variant="ghost" onPress={() => {}} />
      </Link>
    </Screen>
  );
}
