import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors, radii, spacing } from '@/ui/theme/tokens';

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type CalendarGridProps = {
  year: number;
  month: number; // 0-indexed
  bleedingDates: Set<string>;
  loggedDates: Set<string>;
  predictedRange: { start: string; end: string } | null;
  fertileRange: { start: string; end: string } | null;
  onDayPress: (dateISO: string) => void;
};

function inRange(dateISO: string, range: { start: string; end: string } | null): boolean {
  if (!range) return false;
  return isWithinInterval(parseISO(dateISO), { start: parseISO(range.start), end: parseISO(range.end) });
}

export function CalendarGrid({
  year,
  month,
  bleedingDates,
  loggedDates,
  predictedRange,
  fertileRange,
  onDayPress,
}: CalendarGridProps) {
  const monthStart = new Date(year, month, 1);
  const gridStart = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} variant="caption" style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const dateISO = format(day, 'yyyy-MM-dd');
          const outsideMonth = !isSameMonth(day, monthStart);
          const isBleeding = bleedingDates.has(dateISO);
          const isLogged = loggedDates.has(dateISO);
          const isPredicted = inRange(dateISO, predictedRange);
          const isFertile = inRange(dateISO, fertileRange);

          return (
            <Pressable
              key={dateISO}
              onPress={() => onDayPress(dateISO)}
              style={[
                styles.day,
                isFertile && styles.dayFertile,
                isPredicted && styles.dayPredicted,
                isBleeding && styles.dayBleeding,
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: outsideMonth ? colors.charcoalMuted : colors.charcoal,
                  fontWeight: isToday(day) ? '700' : '400',
                  opacity: outsideMonth ? 0.4 : 1,
                }}
              >
                {format(day, 'd')}
              </Text>
              {isLogged ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: radii.sm,
  },
  dayBleeding: {
    backgroundColor: colors.pitahayaLight,
  },
  dayPredicted: {
    borderWidth: 1,
    borderColor: colors.pitahaya,
    borderStyle: 'dashed',
  },
  dayFertile: {
    backgroundColor: colors.stemLight,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.stem,
    marginTop: 2,
  },
});
