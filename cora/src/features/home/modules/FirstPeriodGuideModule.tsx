import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useArticleBySlug } from '@/features/content';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export function FirstPeriodGuideModule() {
  const { data: article, isLoading } = useArticleBySlug('tu-primera-menstruacion');

  if (isLoading || !article) {
    return (
      <Card>
        <Text variant="heading">Tu primera menstruación</Text>
        <Text variant="bodyMuted">Cargando...</Text>
      </Card>
    );
  }

  return (
    <Pressable onPress={() => router.push(`/article/${article.slug}`)}>
      <Card style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Text variant="heading">🌷</Text>
        <View style={{ flex: 1 }}>
          <Text variant="heading">Tu primera menstruación</Text>
          <Text variant="bodyMuted" numberOfLines={2}>
            {article.summary}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
