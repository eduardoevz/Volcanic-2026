import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    chip: {
      borderRadius: radii.full,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.stemLight,
    },
    chipSelected: {
      backgroundColor: colors.pitahaya,
    },
  });
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text
        variant="caption"
        style={{ color: selected ? colors.onBrand : colors.charcoal, fontWeight: '600' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
