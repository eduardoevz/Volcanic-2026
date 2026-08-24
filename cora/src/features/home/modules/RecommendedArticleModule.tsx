import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useRecommendedArticles } from '@/features/content';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function RecommendedArticleModule() {
  const { data: articles, isLoading } = useRecommendedArticles(3);
  const top = articles?.[0];

  if (isLoading) {
    return (
      <Card>
        <Text variant="bodyMuted">Cargando...</Text>
      </Card>
    );
  }

  if (!top) {
    return (
      <Card>
        <Text variant="heading">Artículo recomendado</Text>
        <Text variant="bodyMuted">Todavía no hay artículos para tu etapa.</Text>
      </Card>
    );
  }

  return (
    <Pressable onPress={() => router.push(`/article/${top.slug}`)}>
      <Card style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Text variant="heading">{top.cover_emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text variant="heading">Artículo recomendado</Text>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {top.title}
          </Text>
          <Text variant="bodyMuted" numberOfLines={2}>
            {top.summary}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
