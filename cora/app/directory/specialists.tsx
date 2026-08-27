import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FlatList, Linking, View } from 'react-native';

import { fetchHealthCenterById, useSpecialists } from '@/features/directory';
import { Badge } from '@/ui/components/Badge';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function DirectorySpecialists() {
  const { t } = useTranslation('directory');
  const { healthCenterId } = useLocalSearchParams<{ healthCenterId?: string }>();

  const { data: healthCenter } = useQuery({
    queryKey: ['health-center', healthCenterId ?? null],
    queryFn: () => fetchHealthCenterById(healthCenterId!),
    enabled: !!healthCenterId,
  });

  const { data: specialists, isLoading, isError } = useSpecialists({ healthCenterId });

  return (
    <Screen>
      <FlatList
        data={isError ? [] : (specialists ?? [])}
        keyExtractor={(specialist) => specialist.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
            <Text variant="title">{t('viewSpecialists')}</Text>
            {healthCenter ? <Text variant="bodyMuted">{healthCenter.name}</Text> : null}
            {isError ? <Banner tone="danger" message={t('loadError')} /> : null}
          </View>
        }
        ListEmptyComponent={
          isError ? null : isLoading ? (
            <Text variant="bodyMuted">{t('loading')}</Text>
          ) : (
            <EmptyState
              title={t('emptySpecialistsTitle')}
              description={t('emptySpecialistsDescription')}
            />
          )
        }
        renderItem={({ item: specialist }) => (
          <Card style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
              <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>
                {specialist.full_name}
              </Text>
              {!specialist.is_verified ? <Badge label={t('unverified')} tone="warning" /> : null}
            </View>
            <Badge label={specialist.specialty} tone="neutral" />
            {specialist.phone ? (
              <Button
                label={t('call')}
                variant="secondary"
                onPress={() => Linking.openURL(`tel:${specialist.phone}`)}
              />
            ) : null}
          </Card>
        )}
      />
    </Screen>
  );
}
