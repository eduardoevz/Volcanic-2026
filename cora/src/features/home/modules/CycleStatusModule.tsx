import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePrediction } from '@/features/tracking';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { ProgressRing } from '@/ui/components/ProgressRing';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

const RING_SIZE = 76;
const RING_STROKE = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function CycleStatusModule() {
  const { t } = useTranslation('home');
  const { colors } = useTheme();
  const { prediction, cycles, hasEnoughData, isLoading } = usePrediction();

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
  const lastCycle = cycles[cycles.length - 1];
  const today = new Date();
  const cycleDay = differenceInCalendarDays(today, parseISO(lastCycle.start_date)) + 1;
  const totalLen = differenceInCalendarDays(parseISO(prediction.nextStart), parseISO(lastCycle.start_date));
  const progress = totalLen > 0 ? clamp(cycleDay / totalLen, 0, 1) : 0;
  const phaseLabel =
    cycleDay <= (lastCycle.period_length ?? 0)
      ? t('cycleStatus.phaseMenstrual')
      : cycleDay < 10
        ? t('cycleStatus.phaseFollicular')
        : cycleDay <= 17
          ? t('cycleStatus.phaseFertile')
          : t('cycleStatus.phaseLuteal');

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <ProgressRing size={RING_SIZE} strokeWidth={RING_STROKE} progress={progress} color={colors.pitahaya} trackColor={colors.border}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.charcoal }}>{cycleDay}</Text>
        <Text variant="caption">{t('cycleStatus.dayLabel')}</Text>
      </ProgressRing>
      <View style={{ flex: 1 }}>
        <Text variant="heading">{phaseLabel}</Text>
        <Text variant="bodyMuted" style={{ marginTop: 2 }}>
          {t('cycleStatus.prediction', {
            start: format(new Date(prediction.nextStart), 'd'),
            end: format(endDate, 'd MMM'),
          })}
        </Text>
        <View style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
          <Chip
            label={
              prediction.confidence === 'buena'
                ? t('cycleStatus.confidenceGood')
                : t('cycleStatus.confidenceInitial')
            }
          />
        </View>
      </View>
    </Card>
  );
}
