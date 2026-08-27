import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Linking, ScrollView, View } from 'react-native';

import {
  fetchHealthCenters,
  fetchSpecialists,
  NICARAGUA_DEPARTMENTS,
  useHealthCenters,
  useSpecialists,
} from '@/features/directory';
import { Badge } from '@/ui/components/Badge';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type DirectoryView = 'centers' | 'specialists';
type HealthCenter = Awaited<ReturnType<typeof fetchHealthCenters>>[number];
type Specialist = Awaited<ReturnType<typeof fetchSpecialists>>[number];

const CENTER_TYPES = ['hospital', 'centro_salud', 'clinica', 'casa_materna'] as const;

function CenterCard({ center }: { center: HealthCenter }) {
  const { t } = useTranslation('directory');
  return (
    <Card style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
        <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>
          {center.name}
        </Text>
        {!center.is_verified ? <Badge label={t('unverified')} tone="warning" /> : null}
      </View>
      <Badge label={t(`type.${center.type}`)} tone="neutral" />
      <Text variant="bodyMuted">
        {center.municipality}, {center.department}
      </Text>
      {center.address ? <Text variant="caption">{center.address}</Text> : null}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap' }}>
        {center.phone ? (
          <Button
            label={t('call')}
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${center.phone}`)}
          />
        ) : null}
        {center.latitude != null && center.longitude != null ? (
          <Button
            label={t('viewOnMap')}
            variant="secondary"
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`,
              )
            }
          />
        ) : null}
        <Button
          label={t('viewSpecialistsHere')}
          variant="ghost"
          onPress={() =>
            router.push({ pathname: '/directory/specialists', params: { healthCenterId: center.id } })
          }
        />
      </View>
    </Card>
  );
}

function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const { t } = useTranslation('directory');
  return (
    <Card style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
        <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>
          {specialist.full_name}
        </Text>
        {!specialist.is_verified ? <Badge label={t('unverified')} tone="warning" /> : null}
      </View>
      <Badge label={specialist.specialty} tone="neutral" />
      {specialist.health_centers ? (
        <Text variant="bodyMuted">{specialist.health_centers.name}</Text>
      ) : (
        <Text variant="caption">{t('noHealthCenter')}</Text>
      )}
      {specialist.phone ? (
        <Button
          label={t('call')}
          variant="secondary"
          onPress={() => Linking.openURL(`tel:${specialist.phone}`)}
        />
      ) : null}
    </Card>
  );
}

export default function Directory() {
  const { t } = useTranslation('directory');
  const [view, setView] = useState<DirectoryView>('centers');
  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [type, setType] = useState<(typeof CENTER_TYPES)[number] | undefined>(undefined);
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);

  const {
    data: centers,
    isLoading: centersLoading,
    isError: centersError,
  } = useHealthCenters({ department, type });
  const {
    data: specialists,
    isLoading: specialistsLoading,
    isError: specialistsError,
  } = useSpecialists({ specialty });

  const isCenters = view === 'centers';
  const isLoading = isCenters ? centersLoading : specialistsLoading;
  const isError = isCenters ? centersError : specialistsError;
  const specialties = Array.from(new Set((specialists ?? []).map((s) => s.specialty)));

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
      <Text variant="title">{t('title')}</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Chip label={t('viewCenters')} selected={isCenters} onPress={() => setView('centers')} />
        <Chip
          label={t('viewSpecialists')}
          selected={!isCenters}
          onPress={() => setView('specialists')}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Chip
            label={t('allDepartments')}
            selected={!department}
            onPress={() => setDepartment(undefined)}
          />
          {NICARAGUA_DEPARTMENTS.map((dept) => (
            <Chip
              key={dept}
              label={dept}
              selected={department === dept}
              onPress={() => setDepartment(department === dept ? undefined : dept)}
            />
          ))}
        </View>
      </ScrollView>

      {isCenters ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip label={t('allTypes')} selected={!type} onPress={() => setType(undefined)} />
            {CENTER_TYPES.map((centerType) => (
              <Chip
                key={centerType}
                label={t(`type.${centerType}`)}
                selected={type === centerType}
                onPress={() => setType(type === centerType ? undefined : centerType)}
              />
            ))}
          </View>
        </ScrollView>
      ) : specialties.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip
              label={t('allSpecialties')}
              selected={!specialty}
              onPress={() => setSpecialty(undefined)}
            />
            {specialties.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={specialty === item}
                onPress={() => setSpecialty(specialty === item ? undefined : item)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}

      {isError ? <Banner tone="danger" message={t('loadError')} /> : null}
    </View>
  );

  const emptyState = isError ? null : isLoading ? (
    <Text variant="bodyMuted">{t('loading')}</Text>
  ) : (
    <EmptyState
      title={isCenters ? t('emptyCentersTitle') : t('emptySpecialistsTitle')}
      description={isCenters ? t('emptyCentersDescription') : t('emptySpecialistsDescription')}
    />
  );

  return (
    <Screen>
      {isCenters ? (
        <FlatList
          data={isError ? [] : (centers ?? [])}
          keyExtractor={(center) => center.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          ListHeaderComponent={header}
          ListEmptyComponent={emptyState}
          renderItem={({ item }) => <CenterCard center={item} />}
        />
      ) : (
        <FlatList
          data={isError ? [] : (specialists ?? [])}
          keyExtractor={(specialist) => specialist.id}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
          ListHeaderComponent={header}
          ListEmptyComponent={emptyState}
          renderItem={({ item }) => <SpecialistCard specialist={item} />}
        />
      )}
    </Screen>
  );
}
