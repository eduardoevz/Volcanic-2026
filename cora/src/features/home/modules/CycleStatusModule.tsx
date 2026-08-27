import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { usePrediction } from '@/features/tracking';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';

export function CycleStatusModule() {
  const { t } = useTranslation('home');
  const { prediction, hasEnoughData, isLoading } = usePrediction();

  if (isLoading) {
    return (
      <Card>
        <Text variant="bodyMuted">{t('cycleStatus.loading')}</Text>
      </Card>
    );
  }

  if (!hasEnoughData || !prediction) {
    return (
      <Card>
        <Text variant="heading">{t('cycleStatus.title')}</Text>
        <Text variant="bodyMuted">{t('cycleStatus.needMoreData')}</Text>
      </Card>
    );
  }

  const endDate = new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000);

  return (
    <Card>
      <Text variant="heading">{t('cycleStatus.title')}</Text>
      <Text variant="body">
        {t('cycleStatus.prediction', {
          start: format(new Date(prediction.nextStart), 'd'),
          end: format(endDate, 'd MMM'),
        })}
      </Text>
      <Text variant="caption">
        {prediction.confidence === 'buena'
          ? t('cycleStatus.confidenceGood')
          : t('cycleStatus.confidenceInitial')}
      </Text>
    </Card>
  );
}
