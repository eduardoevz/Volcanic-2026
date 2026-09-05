import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme } from '@/ui/theme/tokens';

// Selector de fecha propio (sin dependencia nativa) — reutiliza la misma
// lógica de grilla mensual que CalendarGrid, simplificada a selección de un
// solo día sin fechas futuras. Ver docs/PROGRESO.md Fase 31.
const WEEKDAY_ANCHORS = eachDayOfInterval({
  start: startOfWeek(new Date(), { weekStartsOn: 1 }),
  end: endOfWeek(new Date(), { weekStartsOn: 1 }),
});

type MiniDatePickerProps = {
  label: string;
  value: string | null; // 'yyyy-MM-dd'
  onChange: (dateISO: string) => void;
  maxDate?: Date;
};

export function MiniDatePicker({ label, value, onChange, maxDate }: MiniDatePickerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const effectiveMaxDate = maxDate ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => (value ? new Date(value) : new Date()));

  const monthStart = startOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const canGoNextMonth = !isAfter(startOfMonth(addMonths(visibleMonth, 1)), effectiveMaxDate);

  return (
    <View style={styles.wrapper}>
      <Text variant="caption" style={styles.label}>
        {label}
      </Text>
      <View style={styles.card}>
        <View style={styles.header}>
          <Pressable onPress={() => setVisibleMonth((m) => subMonths(m, 1))} hitSlop={8}>
            <Text variant="body">‹</Text>
          </Pressable>
          <Text variant="body" style={styles.monthLabel}>
            {format(visibleMonth, 'MMMM yyyy', { locale: es })}
          </Text>
          <Pressable
            onPress={() => canGoNextMonth && setVisibleMonth((m) => addMonths(m, 1))}
            hitSlop={8}
            disabled={!canGoNextMonth}
          >
            <Text variant="body" style={{ opacity: canGoNextMonth ? 1 : 0.3 }}>
              ›
            </Text>
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAY_ANCHORS.map((day) => (
            <Text key={day.getDay()} variant="caption" style={styles.weekdayLabel}>
              {format(day, 'EEEEEE', { locale: es })}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {days.map((day) => {
            const dateISO = format(day, 'yyyy-MM-dd');
            const outsideMonth = !isSameMonth(day, visibleMonth);
            const future = isAfter(day, effectiveMaxDate);
            const selected = value === dateISO;

            return (
              <Pressable
                key={dateISO}
                disabled={future}
                onPress={() => onChange(dateISO)}
                style={[styles.day, selected && styles.daySelected]}
              >
                <Text
                  variant="caption"
                  style={{
                    color: selected
                      ? colors.onBrand
                      : outsideMonth || future
                        ? colors.charcoalMuted
                        : colors.charcoal,
                    fontWeight: isToday(day) ? '700' : '400',
                    opacity: outsideMonth ? 0.4 : future ? 0.3 : 1,
                  }}
                >
                  {format(day, 'd')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    wrapper: {
      gap: spacing.xs,
    },
    label: {
      marginLeft: spacing.xs,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: radii.lg,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    monthLabel: {
      textTransform: 'capitalize',
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    weekdayLabel: {
      flex: 1,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    day: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.md,
    },
    daySelected: {
      backgroundColor: colors.pitahaya,
    },
  });
}
