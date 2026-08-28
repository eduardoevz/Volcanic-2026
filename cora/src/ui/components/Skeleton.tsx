import { useEffect, useMemo } from 'react';
import { StyleSheet, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, type ColorScheme } from '@/ui/theme/tokens';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
};

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.border,
    },
  });
}

export function Skeleton({ width = '100%', height = 16, radius = radii.sm }: SkeletonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.base, { width, height, borderRadius: radius }, animatedStyle]} />
  );
}
