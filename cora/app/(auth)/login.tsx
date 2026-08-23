import { Link } from 'expo-router';

import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Login() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Iniciar sesión
      </Text>
      <Input label="Correo" placeholder="vos@correo.com" style={{ marginBottom: spacing.sm }} />
      <Input
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        style={{ marginBottom: spacing.md }}
      />
      <Button label="Entrar" onPress={() => {}} style={{ marginBottom: spacing.sm }} />
      <Link href="/(auth)/register" asChild>
        <Button label="Crear cuenta" variant="ghost" onPress={() => {}} />
      </Link>
    </Screen>
  );
}
