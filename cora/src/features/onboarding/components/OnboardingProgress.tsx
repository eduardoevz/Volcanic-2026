import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

const TOTAL_STEPS = 5;

type OnboardingProgressProps = {
  step: number; // 1..5
};

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
}

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  const { t } = useTranslation('onboarding');
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text variant="caption" style={{ marginBottom: spacing.xs }}>
        {t('progress.stepOf', { step, total: TOTAL_STEPS })}
      </Text>
      <View style={styles.track}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View key={index} style={[styles.segment, index < step && styles.segmentActive]} />
        ))}
      </View>
    </View>
  );
}
