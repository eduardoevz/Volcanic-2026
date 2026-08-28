import { useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { checkMascotEvolution } from '@/features/mascot';
import { completeOnboarding, OnboardingProgress } from '@/features/onboarding';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

export default function ConsentScreen() {
  const { t } = useTranslation('onboarding');
  const { colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiShareHealthContext, setAiShareHealthContext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();
  const queryClient = useQueryClient();

  const handleAccept = async () => {
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding({ notificationsEnabled, aiShareHealthContext });
      await queryClient.invalidateQueries({ queryKey: ['profile', session?.user.id] });
      if (session?.user.id) await checkMascotEvolution(queryClient, session.user.id);
      router.replace('/(tabs)/home');
    } catch {
      setError(t('consent.saveError'));
      setSaving(false);
    }
  };

  return (
    <Screen>
      <OnboardingProgress step={5} />
      <Text variant="title" style={{ marginBottom: spacing.md }}>
        {t('consent.title')}
      </Text>

      {error ? <Banner message={error} tone="danger" /> : null}

      <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: colors.pitahaya }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="body">{t('consent.notificationsLabel')}</Text>
            <Text variant="caption">{t('consent.notificationsDescription')}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Switch
            value={aiShareHealthContext}
            onValueChange={setAiShareHealthContext}
            trackColor={{ true: colors.pitahaya }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="body">{t('consent.aiShareLabel')}</Text>
            <Text variant="caption">{t('consent.aiShareDescription')}</Text>
          </View>
        </View>
      </View>

      <Banner message={t('consent.disclaimer')} tone="info" />

      <Button
        label={t('consent.accept')}
        onPress={handleAccept}
        loading={saving}
        style={{ marginTop: spacing.lg }}
      />
    </Screen>
  );
}
