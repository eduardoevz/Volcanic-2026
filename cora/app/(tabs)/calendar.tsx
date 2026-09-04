import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { addMonths, differenceInCalendarDays, endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CalendarGrid } from '@/features/tracking/components/CalendarGrid';
import {
  confirmedPeriodDates,
  fertileWindowStatus,
  ovulationDay,
  useDailyLogsRange,
  usePrediction,
  type Cycle,
} from '@/features/tracking';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { ProgressRing } from '@/ui/components/ProgressRing';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { MOOD_EMOJI } from '@/shared/constants/mood';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';

const CARD_RING_SIZE = 84;
const CARD_RING_STROKE = 9;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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

  const { prediction, cycles, fertileWindow, hasEnoughData, isLoading, isError: predictionError } =
    usePrediction();

  const bleedingDates = useMemo(() => confirmedPeriodDates(monthLogs ?? []), [monthLogs]);
  const loggedDates = useMemo(() => new Set((monthLogs ?? []).map((l) => l.log_date)), [monthLogs]);
  const sexualActivityDates = useMemo(
    () => new Set((monthLogs ?? []).filter((l) => l.sexual_activity).map((l) => l.log_date)),
    [monthLogs]
  );
  const ovulationDate = useMemo(() => ovulationDay(cycles as Cycle[]), [cycles]);

  const predictedRange = prediction
    ? {
        start: prediction.nextStart,
        end: format(
          new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000),
          'yyyy-MM-dd'
        ),
      }
    : null;

  // Mismo cálculo que CycleStatusModule (día del ciclo / duración total
  // estimada) — los dos anillos muestran el mismo número para el mismo día.
  const nextPeriodRing =
    prediction && cycles.length > 0
      ? (() => {
          const lastCycle = cycles[cycles.length - 1];
          const cycleDay = differenceInCalendarDays(new Date(), parseISO(lastCycle.start_date)) + 1;
          const totalLen = differenceInCalendarDays(parseISO(prediction.nextStart), parseISO(lastCycle.start_date));
          const daysUntil = differenceInCalendarDays(parseISO(prediction.nextStart), new Date());
          return {
            progress: totalLen > 0 ? clamp(cycleDay / totalLen, 0, 1) : 0,
            daysUntil: Math.max(daysUntil, 0),
          };
        })()
      : null;

  const fertileStatus = fertileWindow ? fertileWindowStatus(fertileWindow, today) : null;

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

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.xs, columnGap: spacing.sm }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 11 }}>❤️</Text>
            <Text variant="caption">{t('calendar.legendSexualActivity')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 11 }}>🥚</Text>
            <Text variant="caption">{t('calendar.legendOvulation')}</Text>
          </View>
        </View>

        <CalendarGrid
          year={year}
          month={month}
          bleedingDates={bleedingDates}
          loggedDates={loggedDates}
          predictedRange={predictedRange}
          fertileRange={fertileWindow}
          sexualActivityDates={sexualActivityDates}
          ovulationDate={ovulationDate}
          onDayPress={(dateISO) => router.push(`/log/${dateISO}`)}
        />

        {!isLoading && !predictionError && !hasEnoughData ? (
          <EmptyState
            title={t('calendar.noHistoryTitle')}
            description={t('calendar.noHistoryDescription')}
          />
        ) : null}

        {prediction && nextPeriodRing ? (
          <LinearGradient
            colors={[colors.pitahaya, colors.pitahayaDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
          >
            <ProgressRing
              size={CARD_RING_SIZE}
              strokeWidth={CARD_RING_STROKE}
              progress={nextPeriodRing.progress}
              color={colors.onBrand}
              trackColor="rgba(255,255,255,0.28)"
            >
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.onBrand }}>
                {nextPeriodRing.daysUntil}
              </Text>
              <Text style={{ fontSize: 11, color: colors.onBrand, opacity: 0.85 }}>
                {t('calendar.daysUnit')}
              </Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text variant="heading" style={{ color: colors.onBrand }}>
                {t('calendar.nextPeriodTitle')}
              </Text>
              <Text variant="body" style={{ color: colors.onBrand, marginTop: 2 }}>
                {t('calendar.nextPeriodRange', {
                  start: format(new Date(prediction.nextStart), 'd'),
                  end: format(
                    new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000),
                    'd MMM',
                    { locale: es }
                  ),
                })}
              </Text>
              <View style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
                <Chip
                  label={
                    prediction.confidence === 'buena'
                      ? t('calendar.confidenceGood')
                      : t('calendar.confidenceInitial')
                  }
                />
              </View>
            </View>
          </LinearGradient>
        ) : null}

        {fertileWindow && fertileStatus ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <ProgressRing
              size={CARD_RING_SIZE}
              strokeWidth={CARD_RING_STROKE}
              progress={fertileStatus.progress}
              color={colors.stem}
              trackColor={colors.stemLight}
            >
              <Text style={{ fontSize: 22 }}>🌸</Text>
              <Text style={{ fontSize: 11, color: colors.charcoalMuted }}>
                {fertileStatus.state === 'during'
                  ? t('calendar.fertileInProgress')
                  : fertileStatus.state === 'before'
                    ? t('calendar.fertileDaysToGo', { count: fertileStatus.daysUntilStart })
                    : t('calendar.fertilePast')}
              </Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text variant="heading">{t('calendar.fertileWindowTitle')}</Text>
              <Text variant="bodyMuted" style={{ marginTop: 2 }}>
                {t('calendar.fertileWindowRange', {
                  start: format(parseISO(fertileWindow.start), 'd MMM', { locale: es }),
                  end: format(parseISO(fertileWindow.end), 'd MMM', { locale: es }),
                })}
              </Text>
              <Text variant="caption" style={{ marginTop: spacing.xs }}>
                {t('calendar.fertileWindowWarning')}
              </Text>
            </View>
          </Card>
        ) : null}

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
