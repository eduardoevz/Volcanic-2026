import { router } from 'expo-router';
import { View } from 'react-native';

import { useArticlesByIds } from '@/features/content';
import { Chip } from '@/ui/components/Chip';
import { spacing } from '@/ui/theme/tokens';

export function SourceChips({ contentIds }: { contentIds: string[] }) {
  const { data: articles } = useArticlesByIds(contentIds);

  if (!articles || articles.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
      {articles.map((article) => (
        <Chip
          key={article.id}
          label={`${article.cover_emoji} ${article.title}`}
          onPress={() => router.push(`/article/${article.slug}`)}
        />
      ))}
    </View>
  );
}
