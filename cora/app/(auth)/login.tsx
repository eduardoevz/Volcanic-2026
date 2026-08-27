import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LoginForm } from '@/features/auth';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Login() {
  const { t } = useTranslation('auth');

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        {t('login.title')}
      </Text>
      <LoginForm />
      <Link href="/(auth)/register" asChild>
        <Button label={t('login.createAccount')} variant="ghost" onPress={() => {}} style={{ marginTop: spacing.sm }} />
      </Link>
    </Screen>
  );
}
