import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollView, View } from 'react-native';

import { CalendarGrid } from '@/features/tracking/components/CalendarGrid';
import { useDailyLogsRange, usePrediction } from '@/features/tracking';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

const MOOD_LABELS: Record<string, string> = {
  great: '😄 Genial',
  good: '🙂 Bien',
  neutral: '😐 Neutral',
  low: '😔 Bajo',
  difficult: '😣 Difícil',
};

export default function CalendarScreen() {
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
        <Text variant="title">Calendario</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            label="‹"
            variant="ghost"
            accessibilityLabel="Mes anterior"
            onPress={() => setCursor((c) => subMonths(c, 1))}
          />
          <Text variant="heading">{format(cursor, 'MMMM yyyy', { locale: es })}</Text>
          <Button
            label="›"
            variant="ghost"
            accessibilityLabel="Mes siguiente"
            onPress={() => setCursor((c) => addMonths(c, 1))}
          />
        </View>

        {monthLogsError || recentLogsError || predictionError ? (
          <Banner
            message="No pudimos cargar tus registros. Revisá tu conexión e intentá de nuevo."
            tone="danger"
          />
        ) : null}

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
            title="Todavía no hay suficiente historial"
            description="Registrá al menos 2 ciclos para ver una predicción."
          />
        ) : null}

        {prediction ? (
          <Card>
            <Text variant="heading">Próximo período estimado</Text>
            <Text variant="body">
              Entre el {format(new Date(prediction.nextStart), 'd')} y el{' '}
              {format(
                new Date(new Date(prediction.nextStart).getTime() + prediction.windowDays * 86400000),
                'd MMM',
                { locale: es }
              )}{' '}
              ({prediction.confidence === 'buena' ? 'confianza buena' : 'estimación'})
            </Text>
          </Card>
        ) : null}

        {fertileWindow ? (
          <Banner
            message="Ventana fértil estimada. Esta estimación no es un método anticonceptivo."
            tone="warning"
          />
        ) : null}

        <View>
          <Text variant="heading" style={{ marginBottom: spacing.xs }}>
            Últimos 30 días
          </Text>
          {recentLogsError ? null : (recentLogs ?? []).length === 0 ? (
            <EmptyState
              title="Sin registros todavía"
              description="Tocá un día del calendario para empezar a registrar."
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
                      {log.mood ? MOOD_LABELS[log.mood] : ''}
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
