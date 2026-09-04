import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

import { useArticles } from '@/features/content';
import {
  computeDueDate,
  computeTrimester,
  computeWeek,
  useActivePregnancy,
  useCreatePregnancy,
  useEndPregnancy,
  useUpdatePregnancyNotes,
} from '@/features/pregnancy';
import { useDailyLogsRange } from '@/features/tracking';
import { MOOD_EMOJI } from '@/shared/constants/mood';
import { LIFE_STAGES, LIFE_STAGE_META, type LifeStage } from '@/shared/constants/lifeStages';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { useSession } from '@/shared/hooks/useSession';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing } from '@/ui/theme/tokens';
import type { Mood } from '@/features/tracking/cycleEngine';

const NEXT_STAGE_OPTIONS = LIFE_STAGES.filter((stage) => stage !== 'embarazo');

const MOOD_ROW: Mood[] = ['great', 'good', 'neutral', 'low', 'difficult'];
const RING_SIZE = 84;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const GESTATION_WEEKS = 40;

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function Pregnancy() {
  const { t } = useTranslation('pregnancy');
  const { t: tTracking } = useTranslation('tracking');
  const { t: tLibrary } = useTranslation('library');
  const { colors } = useTheme();
  const { session } = useSession();
  const { data: pregnancy, isLoading, isError } = useActivePregnancy();
  const createPregnancy = useCreatePregnancy();
  const endPregnancy = useEndPregnancy();
  const updateNotes = useUpdatePregnancyNotes();
  const { data: articles } = useArticles();

  const [lmpDate, setLmpDate] = useState(toISODate(new Date()));
  const [notes, setNotes] = useState('');
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [nextStage, setNextStage] = useState<LifeStage>('adultez');

  const today = toISODate(new Date());
  const { data: recentLogs } = useDailyLogsRange(pregnancy?.lmp_date ?? today, today);

  const handleCreate = async () => {
    if (!session?.user.id) return;
    const dueDate = computeDueDate(lmpDate);
    await createPregnancy.mutateAsync({ userId: session.user.id, lmpDate, dueDate });
  };

  const handleSaveNotes = async () => {
    if (!pregnancy) return;
    await updateNotes.mutateAsync({ id: pregnancy.id, notes });
  };

  const recentMoodLogs = useMemo(
    () =>
      (recentLogs ?? [])
        .filter((log) => !!log.mood)
        .sort((a, b) => b.log_date.localeCompare(a.log_date))
        .slice(0, 5),
    [recentLogs]
  );

  if (isLoading) {
    return (
      <Screen>
        <Text variant="bodyMuted">{t('loading')}</Text>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Banner tone="danger" message={t('loadError')} />
      </Screen>
    );
  }

  if (!pregnancy) {
    return (
      <Screen>
        <Text variant="title" style={{ marginBottom: spacing.sm }}>
          {t('startTitle')}
        </Text>
        <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
          {t('startDescription')}
        </Text>

        {createPregnancy.isError ? <Banner tone="danger" message={t('createError')} /> : null}

        <Input
          label={t('lmpLabel')}
          placeholder="YYYY-MM-DD"
          value={lmpDate}
          onChangeText={setLmpDate}
        />
        <Button
          label={t('startSubmit')}
          loading={createPregnancy.isPending}
          onPress={handleCreate}
          style={{ marginTop: spacing.md }}
        />
      </Screen>
    );
  }

  const week = computeWeek(pregnancy.lmp_date, today);
  const trimester = computeTrimester(week);
  const progress = Math.min(week / GESTATION_WEEKS, 1);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title">{t('title')}</Text>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={colors.border}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={colors.pitahaya}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              fill="none"
            />
          </Svg>
          <View style={{ position: 'absolute', left: spacing.md, width: RING_SIZE, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.charcoal }}>{week}</Text>
            <Text variant="caption">{t('weeksUnit')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="heading">{t('trimesterLabel', { trimester })}</Text>
            <Text variant="bodyMuted" style={{ marginTop: 2 }}>
              {t('dueDateLabel', {
                date: format(new Date(pregnancy.due_date), "d 'de' MMMM 'de' yyyy", { locale: es }),
              })}
            </Text>
          </View>
        </Card>

        <Card>
          <Text variant="heading" style={{ marginBottom: spacing.sm }}>
            {t('emotionalTitle')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MOOD_ROW.map((mood) => (
              <Pressable
                key={mood}
                accessibilityRole="button"
                accessibilityLabel={tTracking(`mood.${mood}`)}
                onPress={() => router.push(`/log/${today}`)}
                style={{ alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radii.full,
                    backgroundColor: colors.cream,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{MOOD_EMOJI[mood]}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />

          <Text variant="caption" style={{ fontWeight: '700', marginBottom: spacing.xs }}>
            {t('recentEntriesTitle')}
          </Text>
          {recentMoodLogs.length === 0 ? (
            <Text variant="bodyMuted">{t('noRecentEntries')}</Text>
          ) : (
            <View style={{ gap: spacing.xs }}>
              {recentMoodLogs.map((log) => (
                <View
                  key={log.log_date}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text variant="bodyMuted">{format(new Date(log.log_date), 'd MMM', { locale: es })}</Text>
                  <Text variant="body">
                    {MOOD_EMOJI[log.mood as Mood]} {tTracking(`mood.${log.mood}`)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View>
          <Text variant="heading" style={{ marginBottom: spacing.sm }}>
            {t('articlesTitle')}
          </Text>
          {!articles || articles.length === 0 ? (
            <Text variant="bodyMuted">{t('articlesEmpty')}</Text>
          ) : (
            <View style={{ gap: spacing.xs }}>
              {articles.slice(0, 8).map((article) => (
                <Pressable key={article.id} onPress={() => router.push(`/article/${article.slug}`)}>
                  <Card style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: radii.md,
                        backgroundColor: colors.stemLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{article.cover_emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '700' }} numberOfLines={1}>
                        {article.title}
                      </Text>
                      <Text variant="caption">
                        {tLibrary('readingMinutes', { minutes: article.reading_minutes })}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View>
          <Text variant="heading" style={{ marginBottom: spacing.sm }}>
            {t('notesLabel')}
          </Text>
          <Input
            placeholder={t('notesPlaceholder')}
            value={notes || pregnancy.notes || ''}
            onChangeText={setNotes}
          />
          <Button
            label={t('saveNotes')}
            variant="secondary"
            onPress={handleSaveNotes}
            loading={updateNotes.isPending}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <Button label={t('endTracking')} variant="ghost" onPress={() => setConfirmingEnd(true)} />
      </ScrollView>

      <Sheet visible={confirmingEnd} onClose={() => setConfirmingEnd(false)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="heading">{t('endConfirmTitle')}</Text>
          <Text variant="bodyMuted">{t('endConfirmDescription')}</Text>

          {endPregnancy.isError ? <Banner tone="danger" message={t('endConfirmError')} /> : null}

          <Text variant="caption" style={{ fontWeight: '700' }}>
            {t('endStagePrompt')}
          </Text>
          <View style={{ gap: spacing.xs }}>
            {NEXT_STAGE_OPTIONS.map((stage) => (
              <Pressable
                key={stage}
                onPress={() => setNextStage(stage)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  paddingVertical: spacing.xs,
                  opacity: nextStage === stage ? 1 : 0.55,
                }}
              >
                <Text style={{ fontSize: 22 }}>{LIFE_STAGE_META[stage].emoji}</Text>
                <Text variant="body">{LIFE_STAGE_META[stage].label}</Text>
              </Pressable>
            ))}
          </View>

          <Button
            label={t('endConfirmSubmit')}
            loading={endPregnancy.isPending}
            onPress={async () => {
              try {
                await endPregnancy.mutateAsync({
                  id: pregnancy.id,
                  status: 'completed',
                  nextLifeStage: nextStage,
                });
                setConfirmingEnd(false);
              } catch {
                // El Banner de arriba (endPregnancy.isError) ya informa el fallo.
              }
            }}
          />
          <Button label={t('endConfirmCancel')} variant="ghost" onPress={() => setConfirmingEnd(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}
