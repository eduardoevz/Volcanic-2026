import { RegisterForm } from '@/features/auth';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Register() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Crear cuenta
      </Text>
      <RegisterForm />
    </Screen>
  );
}
