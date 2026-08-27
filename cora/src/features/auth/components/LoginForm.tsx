import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { signIn, signInWithGoogle } from '@/features/auth/api';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { loginSchema, type LoginInput } from '@/features/auth/schema';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    const result = await signIn(values);
    if (!result.ok) {
      setFormError(result.error);
    }
    // Si fue exitoso, el listener de sesión (src/store/sessionStore.ts) actualiza
    // el estado global y el gate en app/index.tsx redirige sola a (tabs)/home.
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
            placeholder="••••••••"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        label="Entrar"
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
