import { View } from 'react-native';

import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

export function ReferralCard({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Card
      style={{
        backgroundColor: colors.dangerLight,
        borderWidth: 2,
        borderColor: colors.danger,
        alignSelf: 'flex-start',
        maxWidth: '90%',
      }}
    >
      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 20 }}>⚠️</Text>
        <Text variant="body" style={{ color: colors.danger, flex: 1 }}>
          {text}
        </Text>
      </View>
    </Card>
  );
}
