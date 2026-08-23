import { StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

type Tone = 'info' | 'warning' | 'danger';

type BannerProps = {
  message: string;
  tone?: Tone;
};

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.stemLight, fg: colors.stem },
  warning: { bg: colors.warningLight, fg: colors.warning },
  danger: { bg: colors.dangerLight, fg: colors.danger },
};

export function Banner({ message, tone = 'info' }: BannerProps) {
  const { bg, fg } = toneColors[tone];
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text variant="caption" style={{ color: fg }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radii.md,
    padding: spacing.sm + 2,
  },
});
