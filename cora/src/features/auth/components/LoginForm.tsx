import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('auth');
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
            label={t('shared.emailLabel')}
            placeholder={t('shared.emailPlaceholder')}
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
            label={t('shared.passwordLabel')}
            placeholder={t('shared.passwordPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        label={t('login.submit')}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={{ marginTop: spacing.xs }}
      />

      <Link href="/(auth)/forgot-password" asChild>
        <Button label={t('login.forgotPassword')} variant="ghost" onPress={() => {}} />
      </Link>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text variant="caption">{t('shared.orContinueWith')}</Text>
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
