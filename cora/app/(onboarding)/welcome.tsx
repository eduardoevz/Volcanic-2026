import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Welcome() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        Cora crece contigo
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.lg }}>
        Placeholder de onboarding — los 3 slides de valor + selección de etapa llegan en la
        Fase 3.
      </Text>
      <Button label="Comenzar" onPress={() => {}} />
    </Screen>
  );
}
