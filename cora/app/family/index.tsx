import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import {
  fetchMyCircle,
  fetchSharedWithMe,
  SHARE_SCOPES,
  useFamilyMoodSummary,
  useLeaveCircle,
  useMyCircle,
  useRevokeMembership,
  useSharedWithMe,
  useToggleGrant,
} from '@/features/family';
import { MOOD_LABELS } from '@/features/summary';
import type { Database } from '@/shared/types/database.types';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Chip } from '@/ui/components/Chip';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type Membership = Awaited<ReturnType<typeof fetchMyCircle>>[number];
type SharedMembership = Awaited<ReturnType<typeof fetchSharedWithMe>>[number];
type GrantScope = Database['public']['Enums']['share_scope'];

function activeScopes(membership: { family_share_grants: { scope: GrantScope; revoked_at: string | null }[] }) {
  return new Set(
    membership.family_share_grants.filter((g) => g.revoked_at === null).map((g) => g.scope)
  );
}

function MyCircleCard({ membership }: { membership: Membership }) {
  const { t } = useTranslation('family');
  const toggleGrant = useToggleGrant();
  const revokeMembership = useRevokeMembership();
  const granted = activeScopes(membership);

  return (
    <Card style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
        <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>
          {membership.invite_email}
        </Text>
        <Badge
          label={t(`statusLabels.${membership.status}`)}
          tone={membership.status === 'accepted' ? 'success' : 'neutral'}
        />
      </View>
      {membership.relationship ? <Text variant="bodyMuted">{membership.relationship}</Text> : null}

      {membership.status === 'accepted' ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xs }}>
          {SHARE_SCOPES.map((scope) => (
            <Chip
              key={scope}
              label={t(`scopeLabels.${scope}`)}
              selected={granted.has(scope)}
              onPress={() =>
                toggleGrant.mutate({ membershipId: membership.id, scope, enabled: !granted.has(scope) })
              }
            />
          ))}
        </View>
      ) : null}

      <Button
        label={t('revoke')}
        variant="secondary"
        onPress={() => revokeMembership.mutate(membership.id)}
        style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}
      />
    </Card>
  );
}

function MoodSummaryLine({ ownerId }: { ownerId: string }) {
  const { t } = useTranslation('family');
  const { data, isLoading } = useFamilyMoodSummary(ownerId);
  const top = data?.[0];

  if (isLoading) return <Text variant="caption">{t('loading')}</Text>;
  if (!top) return <Text variant="caption">{t('moodSummaryEmpty')}</Text>;

  return (
    <Text variant="caption">
      {t('moodSummaryLine', { mood: MOOD_LABELS[top.mood], days: top.day_count })}
    </Text>
  );
}

function SharedWithMeCard({ membership }: { membership: SharedMembership }) {
  const { t } = useTranslation('family');
  const leaveCircle = useLeaveCircle();
  const granted = activeScopes(membership);

  return (
    <Card style={{ gap: spacing.xs }}>
      <Text variant="body" style={{ fontWeight: '700' }}>
        {membership.owner_display_name}
      </Text>
      {membership.relationship ? <Text variant="bodyMuted">{membership.relationship}</Text> : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
        {SHARE_SCOPES.filter((scope) => granted.has(scope)).map((scope) => (
          <Badge key={scope} label={t(`scopeLabels.${scope}`)} tone="neutral" />
        ))}
      </View>

      {granted.has('mood_summary') ? <MoodSummaryLine ownerId={membership.owner_id} /> : null}

      <Button
        label={t('leave')}
        variant="secondary"
        onPress={() => leaveCircle.mutate(membership.id)}
        style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}
      />
    </Card>
  );
}

export default function Family() {
  const { t } = useTranslation('family');
  const { data: myCircle, isLoading: myCircleLoading, isError: myCircleError } = useMyCircle();
  const {
    data: sharedWithMe,
    isLoading: sharedLoading,
    isError: sharedError,
  } = useSharedWithMe();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="title">{t('myCircleTitle')}</Text>

          {myCircleError ? <Text variant="bodyMuted">{t('loadError')}</Text> : null}
          {!myCircleError && myCircleLoading ? <Text variant="bodyMuted">{t('loading')}</Text> : null}
          {!myCircleError && !myCircleLoading && (myCircle ?? []).length === 0 ? (
            <EmptyState title={t('emptyMyCircleTitle')} description={t('emptyMyCircleDescription')} />
          ) : null}

          {(myCircle ?? []).map((membership) => (
            <MyCircleCard key={membership.id} membership={membership} />
          ))}

          <Button label={t('invite')} onPress={() => router.push('/family/invite')} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="title">{t('sharedWithMeTitle')}</Text>

          {sharedError ? <Text variant="bodyMuted">{t('loadError')}</Text> : null}
          {!sharedError && sharedLoading ? <Text variant="bodyMuted">{t('loading')}</Text> : null}
          {!sharedError && !sharedLoading && (sharedWithMe ?? []).length === 0 ? (
            <EmptyState
              title={t('emptySharedWithMeTitle')}
              description={t('emptySharedWithMeDescription')}
            />
          ) : null}

          {(sharedWithMe ?? []).map((membership) => (
            <SharedWithMeCard key={membership.id} membership={membership} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
