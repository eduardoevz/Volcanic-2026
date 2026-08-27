import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { useArticles, useCategories, useSearchArticles } from '@/features/content';
import { Badge } from '@/ui/components/Badge';
import { Banner } from '@/ui/components/Banner';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { Input } from '@/ui/components/Input';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Library() {
  const { t } = useTranslation('library');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const isSearching = debouncedSearch.trim().length >= 3;

  const { data: categories } = useCategories();
  const {
    data: browseArticles,
    isLoading: browseLoading,
    isError: browseError,
  } = useArticles(categoryId);
  const {
    data: searchResults,
    isLoading: searchLoading,
    isError: searchError,
  } = useSearchArticles(debouncedSearch);

  const articles = isSearching ? searchResults : browseArticles;
  const isLoading = isSearching ? searchLoading : browseLoading;
  const isError = isSearching ? searchError : browseError;

  return (
    <Screen>
      <FlatList
        data={isError ? [] : (articles ?? [])}
        keyExtractor={(article) => article.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            <Text variant="title">{t('title')}</Text>

            <Input
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChangeText={setSearchInput}
            />

            {!isSearching ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Chip
                    label={t('allCategories')}
                    selected={!categoryId}
                    onPress={() => setCategoryId(undefined)}
                  />
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

            {isError ? <Banner tone="danger" message={t('loadError')} /> : null}
          </View>
        }
        ListEmptyComponent={
          isError ? null : isLoading ? (
            <Text variant="bodyMuted">{t('loading')}</Text>
          ) : (
            <EmptyState
              title={isSearching ? t('noResultsTitle') : t('emptyTitle')}
              description={isSearching ? t('noResultsDescription') : t('emptyDescription')}
            />
          )
        }
        renderItem={({ item: article }) => (
          <Pressable onPress={() => router.push(`/article/${article.slug}`)}>
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
                  <Text variant="caption">{t('readingMinutes', { minutes: article.reading_minutes })}</Text>
                  {!article.reviewed_by_name ? (
                    <Badge label={t('pendingReview')} tone="warning" />
                  ) : null}
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
