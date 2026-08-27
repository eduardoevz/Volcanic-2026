import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { updatePassword } from '@/features/auth/api';
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/schema';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { PasswordInput } from '@/ui/components/PasswordInput';
import { spacing } from '@/ui/theme/tokens';

export function ResetPasswordForm() {
  const { setPasswordRecovery } = useSession();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setFormError(null);
    const result = await updatePassword(values.password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    // Libera el gate de (auth): el layout ya puede redirigir a onboarding/tabs
    // con la sesión de recuperación, que ahora es la sesión real.
    setPasswordRecovery(false);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {formError ? <Banner message={formError} tone="danger" /> : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label="Nueva contraseña"
            placeholder="mínimo 8 caracteres"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="repetí la contraseña"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      <Button
        label="Guardar contraseña"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={{ marginTop: spacing.xs }}
      />
    </View>
  );
}
