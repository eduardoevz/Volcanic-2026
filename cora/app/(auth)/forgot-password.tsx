import { Link } from 'expo-router';

import { ForgotPasswordForm } from '@/features/auth';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function ForgotPassword() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Recuperar contraseña
      </Text>
      <ForgotPasswordForm />
      <Link href="/(auth)/login" asChild>
        <Button label="Volver a iniciar sesión" variant="ghost" onPress={() => {}} style={{ marginTop: spacing.sm }} />
      </Link>
    </Screen>
  );
}
