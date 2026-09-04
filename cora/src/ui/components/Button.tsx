import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

function buildVariantStyles(colors: ColorScheme): Record<Variant, ViewStyle> {
  return {
    primary: { backgroundColor: colors.pitahaya },
    secondary: { backgroundColor: colors.stemLight },
    ghost: { backgroundColor: 'transparent' },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.charcoal },
    danger: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.danger },
  };
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const variantStyles = useMemo(() => buildVariantStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ? colors.onBrand : variant === 'danger' ? colors.danger : colors.pitahaya
          }
        />
      ) : (
        <Text
          variant="button"
          style={
            variant === 'primary'
              ? undefined
              : {
                  color:
                    variant === 'outline'
                      ? colors.charcoal
                      : variant === 'danger'
                        ? colors.danger
                        : colors.pitahaya,
                }
          }
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
