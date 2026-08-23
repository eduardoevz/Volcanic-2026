import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/ui/theme/tokens';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  style?: ViewStyle;
}>;

export function Screen({ children, padded = true, style }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
