import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, type ColorScheme } from '@/ui/theme/tokens';

type LevelProgressBarProps = {
  progress: number; // 0..1
};

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    track: {
      height: 12,
      borderRadius: radii.full,
      backgroundColor: colors.stemLight,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radii.full,
      backgroundColor: colors.stem,
    },
  });
}

export function LevelProgressBar({ progress }: LevelProgressBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(1, Math.max(0, progress)), { duration: 500 });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}
