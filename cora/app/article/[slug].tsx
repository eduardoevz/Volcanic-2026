import { useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { MarkdownBody, useArticleBySlug, useMarkArticleRead } from '@/features/content';
import { Badge } from '@/ui/components/Badge';
import { Card } from '@/ui/components/Card';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

const READ_THRESHOLD_MS = 20_000;

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: article, isLoading } = useArticleBySlug(slug);
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

  if (isLoading || !article) {
    return (
      <Screen>
        <Text variant="bodyMuted">Cargando...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="heading">{`${article.cover_emoji}  ${article.title}`}</Text>

        <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
          <Text variant="caption">{`${article.reading_minutes} min de lectura`}</Text>
          {article.author_name ? <Text variant="caption">{`· ${article.author_name}`}</Text> : null}
        </View>

        {article.reviewed_by_name ? (
          <Card>
            <Text variant="caption" style={{ fontWeight: '700' }}>
              Revisado por {article.reviewed_by_name}
            </Text>
            {article.reviewed_by_credentials ? (
              <Text variant="caption">{article.reviewed_by_credentials}</Text>
            ) : null}
            {article.reviewed_at ? <Text variant="caption">{`Revisado el ${article.reviewed_at}`}</Text> : null}
          </Card>
        ) : (
          <Badge label="Pendiente de revisión profesional" tone="warning" />
        )}

        <MarkdownBody markdown={article.body_md} />

        {article.content_sources.length > 0 ? (
          <View style={{ gap: spacing.xs }}>
            <Text variant="heading">Fuentes</Text>
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
          Esta información es educativa y no reemplaza la consulta con un profesional de salud.
        </Text>
      </ScrollView>
    </Screen>
  );
}
