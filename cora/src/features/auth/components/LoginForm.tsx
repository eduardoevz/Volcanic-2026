import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { signIn, signInWithGoogle } from '@/features/auth/api';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { loginSchema, type LoginInput } from '@/features/auth/schema';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    fields: {
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    pillField: {
      borderRadius: radii.full,
      borderWidth: 1.5,
      borderColor: colors.charcoal,
    },
    forgotPassword: {
      alignSelf: 'center',
    },
    band: {
      marginTop: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    landscape: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    pillButton: {
      borderRadius: radii.full,
    },
    mascot: {
      alignSelf: 'center',
      width: 130,
      height: 158,
      marginTop: spacing.md,
    },
  });
}

export function LoginForm() {
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
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
    <View>
      <View style={styles.fields}>
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
              style={styles.pillField}
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
              style={styles.pillField}
            />
          )}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Button
            label={t('login.forgotPassword')}
            variant="ghost"
            onPress={() => {}}
            style={styles.forgotPassword}
          />
        </Link>
      </View>

      <View style={styles.band}>
        <Image
          source={require('../../../../assets/images/welcome/landscape-login.png')}
          style={styles.landscape}
          resizeMode="cover"
        />

        <Button
          label={t('login.submit')}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={styles.pillButton}
        />

        <Link href="/(auth)/register" asChild>
          <Button
            label={t('login.createAccount')}
            variant="outline"
            onPress={() => {}}
            style={styles.pillButton}
          />
        </Link>

        <GoogleSignInButton
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          style={styles.pillButton}
        />

        <Image
          source={require('../../../../assets/images/welcome/mascot-hands.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
