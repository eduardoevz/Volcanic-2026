import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { signInWithGoogle, signUp } from '@/features/auth/api';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { registerSchema, type RegisterInput } from '@/features/auth/schema';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    const result = await signUp(values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSuccess(true);
    // El trigger on_auth_user_created ya creó profiles/user_preferences/mascot_state.
    // Si la confirmación de correo está desactivada, signUp() devuelve sesión directo
    // y el listener global redirige sola a (tabs)/home.
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) {
      setFormError(result.error);
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {formError ? <Banner message={formError} tone="danger" /> : null}
      {success ? (
        <Banner message="Cuenta creada. Iniciando sesión..." tone="info" />
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Correo"
            placeholder="vos@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label="Contraseña"
            placeholder="mínimo 8 caracteres"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        label="Registrarme"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={{ marginTop: spacing.xs }}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text variant="caption">o continuá con</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton onPress={handleGoogleSignIn} loading={googleLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
