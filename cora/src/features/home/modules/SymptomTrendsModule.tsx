import { useTranslation } from 'react-i18next';

import { useRecentSymptomCounts } from '@/features/tracking';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';

export function SymptomTrendsModule() {
  const { t } = useTranslation('home');
  const { data: counts, isLoading } = useRecentSymptomCounts();
  const top = counts?.[0];

  return (
    <Card>
      <Text variant="heading">{t('symptomTrends.title')}</Text>
      {isLoading ? (
        <Text variant="bodyMuted">{t('symptomTrends.loading')}</Text>
      ) : top ? (
        <Text variant="body">
          {t('symptomTrends.count', { label: top.label, count: top.count })}
        </Text>
      ) : (
        <Text variant="bodyMuted">{t('symptomTrends.empty')}</Text>
      )}
    </Card>
  );
}
