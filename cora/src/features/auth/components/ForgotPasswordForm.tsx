import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { requestPasswordReset } from '@/features/auth/api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schema';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { spacing } from '@/ui/theme/tokens';

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setFormError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {formError ? <Banner message={formError} tone="danger" /> : null}
      {sent ? (
        <Banner
          message="Si el correo existe, te enviamos un enlace para restablecer tu contraseña. Revisá tu bandeja de entrada."
          tone="info"
        />
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

      <Button
        label="Enviar enlace"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        style={{ marginTop: spacing.xs }}
      />
    </View>
  );
}
