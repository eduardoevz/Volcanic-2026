import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { useCycleStats, useHealthSignals, useRecentSymptomCounts } from '@/features/tracking';
import { Banner } from '@/ui/components/Banner';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Stats() {
  const { t } = useTranslation('tracking');
  const { stats: cycleStats, isLoading: cycleStatsLoading } = useCycleStats();
  const { data: symptomCounts, isLoading: symptomCountsLoading } = useRecentSymptomCounts();
  const { signals } = useHealthSignals();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title">{t('stats.title')}</Text>

        {signals.length > 0 ? <Banner message={t('referral.message')} tone="warning" /> : null}

        {!cycleStatsLoading && !cycleStats ? (
          <EmptyState
            title={t('stats.notEnoughDataTitle')}
            description={t('stats.notEnoughDataDescription')}
          />
        ) : null}

        {cycleStats ? (
          <Card style={{ gap: spacing.xs }}>
            <Text variant="heading">{t('stats.cycleLengthTitle')}</Text>
            <Text variant="body">
              {t('stats.averageLength', { days: cycleStats.averageDays, count: cycleStats.cycleCount })}
            </Text>
            <Text variant="body">
              {t('stats.lengthRange', { min: cycleStats.minDays, max: cycleStats.maxDays })}
            </Text>
          </Card>
        ) : null}

        <Card style={{ gap: spacing.xs }}>
          <Text variant="heading">{t('stats.symptomFrequencyTitle')}</Text>
          {symptomCountsLoading ? (
            <Text variant="bodyMuted">{t('log.symptomsLoading')}</Text>
          ) : symptomCounts && symptomCounts.length > 0 ? (
            <View style={{ gap: spacing.xs }}>
              {symptomCounts.map((symptom) => (
                <Text variant="body" key={symptom.label}>
                  {t('stats.symptomFrequency', { label: symptom.label, count: symptom.count })}
                </Text>
              ))}
            </View>
          ) : (
            <Text variant="bodyMuted">{t('stats.symptomFrequencyEmpty')}</Text>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
