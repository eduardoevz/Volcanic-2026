import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAcceptInvite } from '@/features/family';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function FamilyAccept() {
  const { t } = useTranslation('family');
  const { membershipId } = useLocalSearchParams<{ membershipId?: string }>();
  const { status } = useSession();
  const acceptInvite = useAcceptInvite();

  useEffect(() => {
    if (status === 'signedIn' && membershipId && acceptInvite.isIdle) {
      acceptInvite.mutate(membershipId, {
        onSuccess: () => router.replace('/family'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, membershipId]);

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        {t('acceptTitle')}
      </Text>

      {!membershipId ? <Banner tone="danger" message={t('acceptInvalidLink')} /> : null}

      {membershipId && status === 'signedOut' ? (
        <View style={{ gap: spacing.sm }}>
          <Banner tone="warning" message={t('acceptNeedsLogin')} />
          <Button label={t('acceptGoToLogin')} onPress={() => router.push('/(auth)/login')} />
          <Button
            label={t('acceptGoToRegister')}
            variant="ghost"
            onPress={() => router.push('/(auth)/register')}
          />
        </View>
      ) : null}

      {membershipId && status === 'signedIn' ? (
        acceptInvite.isPending ? (
          <Banner tone="info" message={t('acceptVerifying')} />
        ) : acceptInvite.isError ? (
          <Banner tone="danger" message={t('acceptError')} />
        ) : null
      ) : null}
    </Screen>
  );
}
