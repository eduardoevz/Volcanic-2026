import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '@/ui/theme/tokens';

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
});
