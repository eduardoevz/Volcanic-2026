import { View } from 'react-native';

import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type PlaceholderModuleProps = {
  emoji: string;
  title: string;
  description: string;
};

// Módulos cuya data real llega en fases posteriores del plan — se muestran
// como tarjetas honestas en vez de simularse con datos falsos.
export function PlaceholderModule({ emoji, title, description }: PlaceholderModuleProps) {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="heading">{title}</Text>
        <Text variant="bodyMuted">{description}</Text>
      </View>
    </Card>
  );
}
