import { View } from 'react-native';

import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';

type PlaceholderModuleProps = {
  emoji: string;
  title: string;
  description: string;
};

// Módulos cuya data real llega en fases posteriores del plan — se muestran
// como tarjetas honestas en vez de simularse con datos falsos.
export function PlaceholderModule({ emoji, title, description }: PlaceholderModuleProps) {
  const { colors } = useTheme();
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: radii.md,
          backgroundColor: colors.stemLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="heading">{title}</Text>
        <Text variant="bodyMuted">{description}</Text>
      </View>
    </Card>
  );
}
