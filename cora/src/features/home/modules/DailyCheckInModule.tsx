import { router } from 'expo-router';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useDailyLog } from '@/features/tracking';
import type { Mood } from '@/features/tracking/cycleEngine';
import { MOOD_EMOJI } from '@/shared/constants/mood';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';

const MOOD_ROWS: Mood[] = ['good', 'great', 'neutral', 'low', 'difficult'];

export function DailyCheckInModule() {
  const { t } = useTranslation('home');
  const { colors } = useTheme();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayLog, isLoading } = useDailyLog(today);
  const alreadyLogged = !isLoading && !!todayLog;

  return (
    <Card>
      <Text variant="heading" style={{ marginBottom: spacing.sm }}>
        {alreadyLogged ? t('dailyCheckIn.loggedTitle') : t('dailyCheckIn.notLoggedTitle')}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {MOOD_ROWS.map((mood) => {
          const selected = todayLog?.mood === mood;
          return (
            <Pressable
              key={mood}
              accessibilityRole="button"
              accessibilityLabel={t(`mood.${mood}`, { ns: 'tracking' })}
              onPress={() => router.push(`/log/${today}`)}
              style={{ alignItems: 'center', gap: 6 }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: radii.full,
                  backgroundColor: selected ? colors.pitahaya : colors.cream,
                  borderWidth: selected ? 0 : 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{MOOD_EMOJI[mood]}</Text>
              </View>
              <Text variant="caption">{t(`mood.${mood}`, { ns: 'tracking' })}</Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
