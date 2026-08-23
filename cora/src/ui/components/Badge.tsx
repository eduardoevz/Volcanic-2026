import { StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

type BadgeProps = {
  label: string;
  tone?: Tone;
};

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.stemLight, fg: colors.stem },
  success: { bg: colors.successLight, fg: colors.success },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { bg, fg } = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text variant="caption" style={{ color: fg, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
});
