import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="caption" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.charcoalMuted}
        {...rest}
      />
      {error ? (
        <Text variant="caption" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    marginLeft: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
});
