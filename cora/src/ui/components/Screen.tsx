import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing, type ColorScheme } from '@/ui/theme/tokens';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  style?: ViewStyle;
}>;

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.cream,
    },
    container: {
      flex: 1,
    },
    padded: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
  });
}

export function Screen({ children, padded = true, style }: ScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}
