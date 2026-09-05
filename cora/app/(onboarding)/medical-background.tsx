import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { MedicalBackgroundForm, useSaveMedicalBackground, type MedicalBackgroundInput } from '@/features/medicalBackground';
import { OnboardingProgress } from '@/features/onboarding';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function MedicalBackgroundScreen() {
  const { t } = useTranslation('onboarding');
  const saveMedicalBackground = useSaveMedicalBackground();
  const [error, setError] = useState<string | null>(null);

  const goNext = () => router.push('/(onboarding)/mascot');

  const handleSubmit = async (input: MedicalBackgroundInput) => {
    setError(null);
    try {
      await saveMedicalBackground.mutateAsync(input);
      goNext();
    } catch {
      setError(t('medicalBackground.saveError'));
    }
  };

  return (
    <Screen>
      <OnboardingProgress step={5} />
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title" style={{ marginBottom: spacing.xs }}>
          {t('medicalBackground.title')}
        </Text>
        <Text variant="bodyMuted" style={{ marginBottom: spacing.sm }}>
          {t('medicalBackground.subtitle')}
        </Text>

        {error ? <Banner message={error} tone="danger" /> : null}

        <MedicalBackgroundForm
          submitLabel={t('medicalBackground.saveAndContinue')}
          submitting={saveMedicalBackground.isPending}
          onSubmit={handleSubmit}
        />

        <Button label={t('medicalBackground.skipForNow')} variant="ghost" onPress={goNext} />
      </ScrollView>
    </Screen>
  );
}
