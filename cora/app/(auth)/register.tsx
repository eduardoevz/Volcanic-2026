import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { RegisterForm } from '@/features/auth';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Register() {
  const { t } = useTranslation('auth');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title" style={{ marginBottom: spacing.xs }}>
          {t('register.title')}
        </Text>
        <RegisterForm />
      </ScrollView>
    </Screen>
  );
}
