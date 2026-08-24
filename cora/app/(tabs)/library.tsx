import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { useArticles, useCategories, useSearchArticles } from '@/features/content';
import { Badge } from '@/ui/components/Badge';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Library() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const isSearching = debouncedSearch.trim().length >= 3;

  const { data: categories } = useCategories();
  const { data: browseArticles, isLoading: browseLoading } = useArticles(categoryId);
  const { data: searchResults, isLoading: searchLoading } = useSearchArticles(debouncedSearch);

  const articles = isSearching ? searchResults : browseArticles;
  const isLoading = isSearching ? searchLoading : browseLoading;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Text variant="title">Biblioteca</Text>

        <Input
          placeholder="Buscar (ej. cólicos, menopausia)"
          value={searchInput}
          onChangeText={setSearchInput}
        />

        {!isSearching ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Chip label="Todas" selected={!categoryId} onPress={() => setCategoryId(undefined)} />
              {(categories ?? []).map((cat) => (
                <Chip
                  key={cat.id}
                  label={`${cat.icon ?? ''} ${cat.name_es}`.trim()}
                  selected={categoryId === cat.id}
                  onPress={() => setCategoryId(categoryId === cat.id ? undefined : cat.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : null}

        {isLoading ? (
          <Text variant="bodyMuted">Cargando...</Text>
        ) : (articles ?? []).length === 0 ? (
          <EmptyState
            title={isSearching ? 'Sin resultados' : 'Sin artículos todavía'}
            description={
              isSearching
                ? 'Probá con otra palabra, como "cólicos" o "menopausia".'
                : 'Todavía no hay artículos para esta categoría.'
            }
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {(articles ?? []).map((article) => (
              <Pressable key={article.id} onPress={() => router.push(`/article/${article.slug}`)}>
                <Card style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                  <Text variant="heading">{article.cover_emoji}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="body" style={{ fontWeight: '700' }}>
                      {article.title}
                    </Text>
                    <Text variant="bodyMuted" numberOfLines={2}>
                      {article.summary}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 2, alignItems: 'center' }}>
                      <Text variant="caption">{`${article.reading_minutes} min de lectura`}</Text>
                      {!article.reviewed_by_name ? (
                        <Badge label="Pendiente de revisión" tone="warning" />
                      ) : null}
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
