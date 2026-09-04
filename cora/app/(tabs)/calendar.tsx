import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CalendarGrid } from '@/features/tracking/components/CalendarGrid';
import { useDailyLogsRange, usePrediction } from '@/features/tracking';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { MOOD_EMOJI } from '@/shared/constants/mood';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';

export default function CalendarScreen() {
  const { t } = useTranslation('tracking');
  const { colors } = useTheme();
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthStart = format(startOfMonth(cursor), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(cursor), 'yyyy-MM-dd');
  const { data: monthLogs, isError: monthLogsError } = useDailyLogsRange(monthStart, monthEnd);

  const thirtyDaysAgo = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: recentLogs, isError: recentLogsError } = useDailyLogsRange(thirtyDaysAgo, today);

  const { prediction, fertileWindow, hasEnoughData, isLoading, isError: predictionError } =
    usePrediction();

  const bleedingDates = useMemo(
    () =>
      new Set(
        (monthLogs ?? [])
          .filter((l) => l.flow_level && l.flow_level !== 'none')
          .map((l) => l.log_date)
      ),
    [monthLogs]
  );
  const loggedDates = useMemo(() => new Set((monthLogs ?? []).map((l) => l.log_date)), [monthLogs]);

  const predictedRange = prediction
    ? {
        start: prediction.nextStart,
        end: format(
          new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000),
          'yyyy-MM-dd'
        ),
      }
    : null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title">{t('calendar.title')}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            label="‹"
            variant="ghost"
            accessibilityLabel={t('calendar.prevMonth')}
            onPress={() => setCursor((c) => subMonths(c, 1))}
          />
          <Text variant="heading">{format(cursor, 'MMMM yyyy', { locale: es })}</Text>
          <Button
            label="›"
            variant="ghost"
            accessibilityLabel={t('calendar.nextMonth')}
            onPress={() => setCursor((c) => addMonths(c, 1))}
          />
        </View>

        {monthLogsError || recentLogsError || predictionError ? (
          <Banner message={t('calendar.loadError')} tone="danger" />
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.pitahaya }} />
            <Text variant="caption">{t('calendar.legendPeriod')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: colors.pitahaya,
              }}
            />
            <Text variant="caption">{t('calendar.legendPredicted')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.stemLight }} />
            <Text variant="caption">{t('calendar.legendFertile')}</Text>
          </View>
        </View>

        <CalendarGrid
          year={year}
          month={month}
          bleedingDates={bleedingDates}
          loggedDates={loggedDates}
          predictedRange={predictedRange}
          fertileRange={fertileWindow}
          onDayPress={(dateISO) => router.push(`/log/${dateISO}`)}
        />

        {!isLoading && !predictionError && !hasEnoughData ? (
          <EmptyState
            title={t('calendar.noHistoryTitle')}
            description={t('calendar.noHistoryDescription')}
          />
        ) : null}

        {prediction ? (
          <LinearGradient
            colors={[colors.pitahaya, colors.pitahayaDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radii.lg, padding: spacing.md }}
          >
            <Text variant="heading" style={{ color: colors.onBrand }}>
              {t('calendar.nextPeriodTitle')}
            </Text>
            <Text variant="body" style={{ color: colors.onBrand }}>
              {t('calendar.nextPeriodRange', {
                start: format(new Date(prediction.nextStart), 'd'),
                end: format(
                  new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000),
                  'd MMM',
                  { locale: es }
                ),
                confidence:
                  prediction.confidence === 'buena'
                    ? t('calendar.confidenceGood')
                    : t('calendar.confidenceInitial'),
              })}
            </Text>
          </LinearGradient>
        ) : null}

        {fertileWindow ? <Banner message={t('calendar.fertileWindowWarning')} tone="warning" /> : null}

        <Button label={t('calendar.viewStats')} variant="secondary" onPress={() => router.push('/stats')} />

        <View>
          <Text variant="heading" style={{ marginBottom: spacing.xs }}>
            {t('calendar.last30DaysTitle')}
          </Text>
          {recentLogsError ? null : (recentLogs ?? []).length === 0 ? (
            <EmptyState
              title={t('calendar.emptyTitle')}
              description={t('calendar.emptyDescription')}
            />
          ) : (
            <View style={{ gap: spacing.xs }}>
              {[...(recentLogs ?? [])]
                .sort((a, b) => b.log_date.localeCompare(a.log_date))
                .map((log) => (
                  <Card key={log.log_date} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="body">{format(new Date(log.log_date), 'd MMM', { locale: es })}</Text>
                    <Text variant="bodyMuted">
                      {log.flow_level && log.flow_level !== 'none' ? '🩸 ' : ''}
                      {log.mood ? `${MOOD_EMOJI[log.mood]} ${t(`mood.${log.mood}`)}` : ''}
                    </Text>
                  </Card>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
