import { Input } from '@/ui/components/Input';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Register() {
  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Crear cuenta
      </Text>
      <Input label="Correo" placeholder="vos@correo.com" style={{ marginBottom: spacing.sm }} />
      <Input
        label="Contraseña"
        placeholder="mínimo 8 caracteres"
        secureTextEntry
        style={{ marginBottom: spacing.md }}
      />
      <Button label="Registrarme" onPress={() => {}} />
    </Screen>
  );
}
