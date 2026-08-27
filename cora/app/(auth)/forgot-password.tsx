import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ForgotPasswordForm } from '@/features/auth';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function ForgotPassword() {
  const { t } = useTranslation('auth');

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        {t('forgotPassword.title')}
      </Text>
      <ForgotPasswordForm />
      <Link href="/(auth)/login" asChild>
        <Button label={t('forgotPassword.backToLogin')} variant="ghost" onPress={() => {}} style={{ marginTop: spacing.sm }} />
      </Link>
    </Screen>
  );
}
