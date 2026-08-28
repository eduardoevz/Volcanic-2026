import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

export default function Index() {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
  const { status } = useSession();
  const { data: profile, isLoading: profileLoading, isError: profileError, refetch } = useProfile();

  if (status === 'loading' || (status === 'signedIn' && profileLoading)) {
    return (
      <Screen padded={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.pitahaya} />
      </Screen>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  // Sin perfil en caché ni de red no podemos saber si ya completó el
  // onboarding — mandarla a onboarding de nuevo la haría repetirlo sin
  // necesidad. Se muestra un reintento en vez de asumir.
  if (profileError && !profile) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Banner tone="danger" message={t('index.sessionCheckError')} />
        <Button label={t('common.retry')} onPress={() => refetch()} />
      </Screen>
    );
  }

  if (!profile?.onboarding_completed_at) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
