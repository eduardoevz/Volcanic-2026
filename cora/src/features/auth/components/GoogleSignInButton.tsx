import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Text } from '@/ui/components/Text';
import { GoogleIcon } from '@/ui/components/icons/GoogleIcon';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

type GoogleSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  style,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('shared.googleContinue')}
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.charcoal} />
      ) : (
        <>
          <GoogleIcon />
          <Text variant="button" style={styles.label}>
            {t('shared.googleContinue')}
          </Text>
        </>
      )}
    </Pressable>
  );
}
