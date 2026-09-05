import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { MiniDatePicker, useSeedHistoricalCycles } from '@/features/tracking';
import { OnboardingProgress } from '@/features/onboarding';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

const DEFAULT_PERIOD_LENGTH = 5;
const MIN_PERIOD_LENGTH = 1;
const MAX_PERIOD_LENGTH = 10;

export default function CycleHistoryScreen() {
  const { t } = useTranslation('onboarding');
  const seedHistoricalCycles = useSeedHistoricalCycles();

  const [lastPeriodStart, setLastPeriodStart] = useState<string | null>(null);
  const [previousPeriodStart, setPreviousPeriodStart] = useState<string | null>(null);
  const [periodLengthText, setPeriodLengthText] = useState(String(DEFAULT_PERIOD_LENGTH));
  const [error, setError] = useState<string | null>(null);

  const goNext = () => router.push('/(onboarding)/avatar');

  const parsedLength = Number.parseInt(periodLengthText, 10);
  const periodLength = Number.isFinite(parsedLength)
    ? Math.min(Math.max(parsedLength, MIN_PERIOD_LENGTH), MAX_PERIOD_LENGTH)
    : DEFAULT_PERIOD_LENGTH;

  const canSubmit = !!lastPeriodStart && !!previousPeriodStart;

  const handleSubmit = async () => {
    if (!lastPeriodStart || !previousPeriodStart) return;

    if (differenceInCalendarDays(parseISO(lastPeriodStart), parseISO(previousPeriodStart)) <= 0) {
      setError(t('cycleHistory.dateOrderError'));
      return;
    }

    setError(null);
    try {
      await seedHistoricalCycles.mutateAsync([
        { startDate: previousPeriodStart, lengthDays: periodLength },
        { startDate: lastPeriodStart, lengthDays: periodLength },
      ]);
      goNext();
    } catch {
      setError(t('cycleHistory.saveError'));
    }
  };

  return (
    <Screen>
      <OnboardingProgress step={3} />
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title" style={{ marginBottom: spacing.xs }}>
          {t('cycleHistory.title')}
        </Text>
        <Text variant="bodyMuted" style={{ marginBottom: spacing.sm }}>
          {t('cycleHistory.subtitle')}
        </Text>

        {error ? <Banner message={error} tone="danger" /> : null}

        <MiniDatePicker
          label={t('cycleHistory.lastPeriodLabel')}
          value={lastPeriodStart}
          onChange={setLastPeriodStart}
        />
        <MiniDatePicker
          label={t('cycleHistory.previousPeriodLabel')}
          value={previousPeriodStart}
          onChange={setPreviousPeriodStart}
        />

        <Input
          label={t('cycleHistory.periodLengthLabel')}
          keyboardType="number-pad"
          value={periodLengthText}
          onChangeText={setPeriodLengthText}
        />

        <Button
          label={t('cycleHistory.saveAndContinue')}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={seedHistoricalCycles.isPending}
          style={{ marginTop: spacing.sm }}
        />
        <Button label={t('cycleHistory.skipForNow')} variant="ghost" onPress={goNext} />
      </ScrollView>
    </Screen>
  );
}
