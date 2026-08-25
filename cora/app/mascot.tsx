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
import { colors, spacing } from '@/ui/theme/tokens';

const ACTION_LABELS: Record<string, string> = {
  onboarding_completed: 'Completaste tu onboarding',
  daily_log: 'Registraste tu día',
  article_read: 'Leíste un artículo',
};

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-NI', {
    day: 'numeric',
    month: 'short',
  });
}

export default function MascotScreen() {
  const { data: mascot, isLoading, isError } = useMascotState();
  const { data: events, isLoading: eventsLoading } = useRecentMascotEvents(15);

  if (isError && !mascot) {
    return (
      <Screen>
        <Banner
          tone="danger"
          message="No pudimos cargar tu pitahaya. Revisá tu conexión e intentá de nuevo."
        />
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
          <Text variant="title">{`${meta.name} · Nivel ${level}`}</Text>
          <Text variant="bodyMuted">{`${mascot.points} puntos acumulados`}</Text>
        </View>

        <Card style={{ gap: spacing.sm }}>
          {next ? (
            <>
              <Text variant="body">{`Le faltan ${next.remaining} puntos para ser ${LEVEL_META[next.nextLevel].name}`}</Text>
              <LevelProgressBar progress={next.progress} />
            </>
          ) : (
            <Text variant="body">Tu pitahaya llegó a su forma más plena. Sigue creciendo con vos.</Text>
          )}
          <Text variant="caption">
            Crece con cada momento de cuidado que registrás — sin castigos ni rachas. Nunca baja
            de nivel.
          </Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text variant="heading">Los 5 niveles</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MASCOT_LEVELS.map((lvl) => {
              const isCurrent = lvl === level;
              const levelMeta = LEVEL_META[lvl];
              return (
                <View key={lvl} style={{ alignItems: 'center', gap: spacing.xs, opacity: isCurrent ? 1 : 0.4 }}>
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
          <Text variant="heading">Momentos de cuidado recientes</Text>
          {eventsLoading ? (
            <Skeleton height={60} />
          ) : !events || events.length === 0 ? (
            <EmptyState
              title="Todavía no hay momentos registrados"
              description="Cada registro, lectura o conversación con Cora suma acá."
            />
          ) : (
            events.map((event) => (
              <Card key={event.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body">{ACTION_LABELS[event.action_type] ?? event.action_type}</Text>
                <Text variant="bodyMuted">{`+${event.points} · ${formatEventDate(event.created_at)}`}</Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
