import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import {
  LEVEL_META,
  LevelProgressBar,
  MASCOT_LEVELS,
  pointsToNextLevel,
  useMascotState,
  useRecentMascotEvents,
  type MascotLevel,
} from '@/features/mascot';
import { Banner } from '@/ui/components/Banner';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Skeleton } from '@/ui/components/Skeleton';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { spacing } from '@/ui/theme/tokens';

export default function MascotScreen() {
  const { t } = useTranslation('mascot');
  const { colors } = useTheme();
  const { data: mascot, isLoading, isError } = useMascotState();
  const { data: events, isLoading: eventsLoading } = useRecentMascotEvents(15);

  const actionLabels: Record<string, string> = {
    onboarding_completed: t('actions.onboarding_completed'),
    daily_log: t('actions.daily_log'),
    article_read: t('actions.article_read'),
  };

  if (isError && !mascot) {
    return (
      <Screen>
        <Banner tone="danger" message={t('loadError')} />
      </Screen>
    );
  }

  if (isLoading || !mascot) {
    return (
      <Screen>
        <Skeleton height={200} />
      </Screen>
    );
  }

  const level = mascot.level as MascotLevel;
  const meta = LEVEL_META[level];
  const next = pointsToNextLevel(mascot.points);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text style={{ fontSize: 96 }}>{meta.emoji}</Text>
          <Text variant="title">{t('levelName', { name: meta.name, level })}</Text>
          <Text variant="bodyMuted">{t('pointsAccumulated', { points: mascot.points })}</Text>
        </View>

        <Card style={{ gap: spacing.sm }}>
          {next ? (
            <>
              <Text variant="body">
                {t('remainingToNextLevel', {
                  remaining: next.remaining,
                  nextLevelName: LEVEL_META[next.nextLevel].name,
                })}
              </Text>
              <LevelProgressBar progress={next.progress} />
            </>
          ) : (
            <Text variant="body">{t('maxLevelReached')}</Text>
          )}
          <Text variant="caption">{t('growthNote')}</Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text variant="heading">{t('levelsTitle')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MASCOT_LEVELS.map((lvl) => {
              const isCurrent = lvl === level;
              const levelMeta = LEVEL_META[lvl];
              return (
                <View
                  key={lvl}
                  style={{ alignItems: 'center', gap: spacing.xs, opacity: isCurrent ? 1 : 0.4 }}
                >
                  <Text style={{ fontSize: 32 }}>{levelMeta.emoji}</Text>
                  <Text
                    variant="caption"
                    style={isCurrent ? { color: colors.pitahaya, fontWeight: '700' } : undefined}
                  >
                    {levelMeta.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="heading">{t('recentMomentsTitle')}</Text>
          {eventsLoading ? (
            <Skeleton height={60} />
          ) : !events || events.length === 0 ? (
            <EmptyState title={t('emptyMomentsTitle')} description={t('emptyMomentsDescription')} />
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text variant="body">{actionLabels[event.action_type] ?? event.action_type}</Text>
                <Text variant="bodyMuted">
                  {t('pointsEarned', {
                    points: event.points,
                    date: format(new Date(event.created_at), 'd MMM', { locale: es }),
                  })}
                </Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
