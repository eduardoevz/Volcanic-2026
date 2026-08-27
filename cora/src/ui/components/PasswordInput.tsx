import { useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native';

import { Input } from '@/ui/components/Input';
import { EyeIcon, EyeOffIcon } from '@/ui/components/icons/EyeIcon';
import { spacing } from '@/ui/theme/tokens';

type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry'> & {
  label?: string;
  error?: string;
};

export function PasswordInput({ label, error, style, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Input
        label={label}
        error={error}
        secureTextEntry={!visible}
        style={[styles.inputPadding, style]}
        {...rest}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={[styles.toggle, { top: label ? LABEL_ROW_HEIGHT + ICON_TOP_IN_INPUT : ICON_TOP_IN_INPUT }]}
        hitSlop={8}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Pressable>
    </View>
  );
}

// Alto aproximado de la fila de label (texto "caption" + el gap del wrapper
// de Input) y el margen para centrar el ícono dentro del TextInput — no hay
// forma de medir esto en tiempo real sin tocar Input.tsx, así que se estima
// a partir de los mismos tokens que usa Input (spacing.sm+2 de padding
// vertical, fontSize 16).
const LABEL_ROW_HEIGHT = 20;
const ICON_TOP_IN_INPUT = 11;

const styles = StyleSheet.create({
  inputPadding: {
    paddingRight: spacing.xl + spacing.sm,
  },
  toggle: {
    position: 'absolute',
    right: spacing.sm,
  },
});
