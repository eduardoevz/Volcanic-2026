import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text
        variant="caption"
        style={{ color: selected ? colors.white : colors.charcoal, fontWeight: '600' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
