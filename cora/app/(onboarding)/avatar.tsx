import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AVATAR_EMOJI, useAvatars } from '@/features/avatars';
import { OnboardingProgress, updateAvatar } from '@/features/onboarding';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { EmptyState } from '@/ui/components/EmptyState';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Skeleton } from '@/ui/components/Skeleton';
import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import { radii, spacing, type ColorScheme, type Shadows } from '@/ui/theme/tokens';
import type { Database } from '@/shared/types/database.types';

type Avatar = Database['public']['Tables']['avatars']['Row'];

function buildStyles(colors: ColorScheme, shadows: Shadows) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    avatarCard: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.white,
      borderRadius: radii.lg,
      padding: spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
      ...shadows.card,
    },
    avatarCardSelected: {
      borderColor: colors.pitahaya,
    },
    avatarEmoji: {
      fontSize: 32,
    },
  });
}

export default function AvatarScreen() {
  const { t } = useTranslation('onboarding');
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => buildStyles(colors, shadows), [colors, shadows]);
  const { data: avatars, isLoading, isError } = useAvatars();
  const [selected, setSelected] = useState<Avatar | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => router.push('/(onboarding)/medical-background');

  const handleChoose = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await updateAvatar(selected.id);
      goNext();
    } catch {
      setError(t('avatar.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <OnboardingProgress step={3} />
      <Text variant="title" style={{ marginBottom: spacing.xs }}>
        {t('avatar.title')}
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        {t('avatar.subtitle')}
      </Text>

      {isError ? (
        <Banner message={t('avatar.loadError')} tone="danger" />
      ) : isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} width={92} height={92} radius={radii.lg} />
          ))}
        </View>
      ) : avatars && avatars.length === 0 ? (
        <EmptyState title={t('avatar.emptyTitle')} description={t('avatar.emptyDescription')} />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {avatars?.map((avatar) => (
            <Pressable
              key={avatar.id}
              onPress={() => setSelected(avatar)}
              style={[styles.avatarCard, selected?.id === avatar.id && styles.avatarCardSelected]}
            >
              <Text style={styles.avatarEmoji}>{AVATAR_EMOJI[avatar.code] ?? '🐾'}</Text>
              <Text variant="caption" style={{ textAlign: 'center' }}>
                {avatar.name_es}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {error ? <Banner message={error} tone="danger" /> : null}

      <Button
        label={t('avatar.chooseThisOne')}
        onPress={handleChoose}
        disabled={!selected}
        loading={saving}
        style={{ marginTop: spacing.md }}
      />
      <Button label={t('avatar.chooseLater')} variant="ghost" onPress={goNext} />

      <Sheet visible={!!selected && !saving} onClose={() => setSelected(null)}>
        {selected ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>
              {AVATAR_EMOJI[selected.code] ?? '🐾'}
            </Text>
            <Text variant="heading" style={{ textAlign: 'center' }}>
              {selected.name_es}
            </Text>
            <Text variant="caption" style={{ textAlign: 'center', fontStyle: 'italic' }}>
              {selected.species_scientific}
            </Text>
            <Text variant="body">{selected.fun_fact_es}</Text>
            <Text variant="bodyMuted">{t('avatar.habitat', { habitat: selected.habitat_es })}</Text>
            <Text variant="bodyMuted">
              {t('avatar.conservationStatus', { status: selected.conservation_status })}
            </Text>
            <Button label={t('avatar.chooseThisOne')} onPress={handleChoose} loading={saving} />
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
