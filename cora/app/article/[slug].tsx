import { useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { MarkdownBody, getArticleAudioUrl, useArticleBySlug, useMarkArticleRead } from '@/features/content';
import { Badge } from '@/ui/components/Badge';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

const READ_THRESHOLD_MS = 20_000;

function ArticleAudioPlayer({ audioPath }: { audioPath: string }) {
  const { t } = useTranslation('library');
  const player = useAudioPlayer(getArticleAudioUrl(audioPath));
  const status = useAudioPlayerStatus(player);

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Button
        label={status.playing ? t('article.audioPause') : t('article.audioPlay')}
        variant="secondary"
        onPress={() => (status.playing ? player.pause() : player.play())}
      />
      <Text variant="bodyMuted">{t('article.audioLabel')}</Text>
    </Card>
  );
}

export default function ArticleScreen() {
  const { t } = useTranslation('library');
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useArticleBySlug(slug);
  const markArticleRead = useMarkArticleRead();
  const markedRef = useRef(false);

  useEffect(() => {
    if (!article) return;
    markedRef.current = false;
    const timer = setTimeout(() => {
      if (!markedRef.current) {
        markedRef.current = true;
        // Fire-and-forget: igual que el guardado offline de la Fase 4, la
        // mutación se pausa sola sin conexión y se retoma al reconectar.
        markArticleRead.mutate(article.id);
      }
    }, READ_THRESHOLD_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  if (isError) {
    return (
      <Screen>
        <Banner tone="danger" message={t('article.loadError')} />
      </Screen>
    );
  }

  if (isLoading || !article) {
    return (
      <Screen>
        <Text variant="bodyMuted">{t('loading')}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="heading">{`${article.cover_emoji}  ${article.title}`}</Text>

        <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
          <Text variant="caption">{t('readingMinutes', { minutes: article.reading_minutes })}</Text>
          {article.author_name ? <Text variant="caption">{`· ${article.author_name}`}</Text> : null}
        </View>

        {article.reviewed_by_name ? (
          <Card>
            <Text variant="caption" style={{ fontWeight: '700' }}>
              {t('article.reviewedBy', { name: article.reviewed_by_name })}
            </Text>
            {article.reviewed_by_credentials ? (
              <Text variant="caption">{article.reviewed_by_credentials}</Text>
            ) : null}
            {article.reviewed_at ? (
              <Text variant="caption">{t('article.reviewedOn', { date: article.reviewed_at })}</Text>
            ) : null}
          </Card>
        ) : (
          <Badge label={t('article.pendingProfessionalReview')} tone="warning" />
        )}

        {article.audio_path ? <ArticleAudioPlayer audioPath={article.audio_path} /> : null}

        <MarkdownBody markdown={article.body_md} />

        {article.content_sources.length > 0 ? (
          <View style={{ gap: spacing.xs }}>
            <Text variant="heading">{t('article.sourcesTitle')}</Text>
            {[...article.content_sources]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((source) => (
                <Pressable key={source.id} onPress={() => Linking.openURL(source.url)}>
                  <Text variant="body" style={{ color: colors.pitahaya }}>
                    {`${source.organization} — ${source.label}`}
                  </Text>
                </Pressable>
              ))}
          </View>
        ) : null}

        <Text variant="caption" style={{ marginTop: spacing.md }}>
          {t('article.disclaimer')}
        </Text>
      </ScrollView>
    </Screen>
  );
}
