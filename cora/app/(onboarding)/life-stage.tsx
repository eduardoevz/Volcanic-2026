import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingProgress, setLifeStage } from '@/features/onboarding';
import { LIFE_STAGES, LIFE_STAGE_META, type LifeStage } from '@/shared/constants/lifeStages';
import { Banner } from '@/ui/components/Banner';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { colors, radii, shadows, spacing } from '@/ui/theme/tokens';

export default function LifeStageScreen() {
  const { t } = useTranslation('onboarding');
  const [saving, setSaving] = useState<LifeStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (stage: LifeStage) => {
    setError(null);
    setSaving(stage);
    try {
      await setLifeStage(stage);
      router.push('/(onboarding)/avatar');
    } catch {
      setError(t('lifeStage.saveError'));
      setSaving(null);
    }
  };

  return (
    <Screen>
      <OnboardingProgress step={2} />
      <Text variant="title" style={{ marginBottom: spacing.xs }}>
        {t('lifeStage.title')}
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        {t('lifeStage.subtitle')}
      </Text>

      {error ? <Banner message={error} tone="danger" /> : null}

      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        {LIFE_STAGES.map((stage) => {
          const meta = LIFE_STAGE_META[stage];
          return (
            <Pressable
              key={stage}
              onPress={() => handleSelect(stage)}
              disabled={saving !== null}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                saving === stage && styles.cardSaving,
              ]}
            >
              <Text style={styles.emoji}>{meta.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="heading">{meta.label}</Text>
                <Text variant="bodyMuted">{meta.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardSaving: {
    opacity: 0.6,
  },
  emoji: {
    fontSize: 36,
  },
});
