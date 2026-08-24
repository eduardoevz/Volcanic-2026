import { Link } from 'expo-router';

import { LoginForm } from '@/features/auth';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Login() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Iniciar sesión
      </Text>
      <LoginForm />
      <Link href="/(auth)/register" asChild>
        <Button label="Crear cuenta" variant="ghost" onPress={() => {}} style={{ marginTop: spacing.sm }} />
      </Link>
    </Screen>
  );
}
