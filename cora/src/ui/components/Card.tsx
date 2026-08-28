import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme, type Shadows } from '@/ui/theme/tokens';

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

function buildStyles(colors: ColorScheme, shadows: Shadows) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...shadows.card,
    },
  });
}

export function Card({ children, style }: CardProps) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => buildStyles(colors, shadows), [colors, shadows]);
  return <View style={[styles.card, style]}>{children}</View>;
}
