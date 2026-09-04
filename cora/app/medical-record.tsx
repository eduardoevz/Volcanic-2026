import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { MedicalBackgroundForm, useMedicalBackground, useSaveMedicalBackground, type MedicalBackgroundInput } from '@/features/medicalBackground';
import { Banner } from '@/ui/components/Banner';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function MedicalRecordScreen() {
  const { t } = useTranslation('settings');
  const { data: medicalBackground, isLoading, isError } = useMedicalBackground();
  const saveMedicalBackground = useSaveMedicalBackground();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (input: MedicalBackgroundInput) => {
    setError(null);
    setSaved(false);
    try {
      await saveMedicalBackground.mutateAsync(input);
      setSaved(true);
    } catch {
      setError(t('medicalRecord.saveError'));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title" style={{ marginBottom: spacing.xs }}>
          {t('medicalRecord.title')}
        </Text>
        <Text variant="bodyMuted" style={{ marginBottom: spacing.sm }}>
          {t('medicalRecord.subtitle')}
        </Text>

        {isError ? <Banner message={t('medicalRecord.loadError')} tone="danger" /> : null}
        {error ? <Banner message={error} tone="danger" /> : null}
        {saved ? <Banner message={t('medicalRecord.saved')} tone="info" /> : null}

        {isLoading ? (
          <Text variant="bodyMuted">{t('medicalRecord.loading')}</Text>
        ) : (
          <MedicalBackgroundForm
            initial={medicalBackground}
            submitLabel={t('medicalRecord.save')}
            submitting={saveMedicalBackground.isPending}
            onSubmit={handleSubmit}
          />
        )}
      </ScrollView>
    </Screen>
  );
}
