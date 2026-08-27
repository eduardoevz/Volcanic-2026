import { useTranslation } from 'react-i18next';

import { RegisterForm } from '@/features/auth';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Register() {
  const { t } = useTranslation('auth');

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        {t('register.title')}
      </Text>
      <RegisterForm />
    </Screen>
  );
}
