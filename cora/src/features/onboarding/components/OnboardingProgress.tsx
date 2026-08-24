import { StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

const TOTAL_STEPS = 5;

type OnboardingProgressProps = {
  step: number; // 1..5
};

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text variant="caption" style={{ marginBottom: spacing.xs }}>
        Paso {step} de {TOTAL_STEPS}
      </Text>
      <View style={styles.track}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[styles.segment, index < step && styles.segmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.pitahaya,
  },
});
