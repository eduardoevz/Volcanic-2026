import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Text } from '@/ui/components/Text';
import { GoogleIcon } from '@/ui/components/icons/GoogleIcon';
import { colors, radii, spacing } from '@/ui/theme/tokens';

type GoogleSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function GoogleSignInButton({ onPress, loading = false, disabled = false }: GoogleSignInButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continuar con Google"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.charcoal} />
      ) : (
        <>
          <GoogleIcon />
          <Text variant="button" style={styles.label}>
            Continuar con Google
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.charcoal,
  },
});
