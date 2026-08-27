import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { signOut } from '@/features/auth';
import { AVATAR_EMOJI } from '@/features/avatars';
import { setLifeStage } from '@/features/onboarding';
import { updateAiShareHealthContext, useProfile, useUserPreferences } from '@/features/profile';
import { setAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';
import { useSession } from '@/shared/hooks/useSession';
import { LIFE_STAGES, LIFE_STAGE_META, type LifeStage } from '@/shared/constants/lifeStages';
import { Avatar } from '@/ui/components/Avatar';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Chip } from '@/ui/components/Chip';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

const LANGUAGE_LABEL_KEYS: Record<SupportedLanguage, 'languageEs' | 'languageMis' | 'languageMyn'> = {
  es: 'languageEs',
  mis: 'languageMis',
  myn: 'languageMyn',
};

export default function Profile() {
  const { t, i18n } = useTranslation('settings');
  const router = useRouter();
  const { session } = useSession();
  const { data: profile, isLoading, isError } = useProfile();
  const { data: preferences, isError: preferencesError } = useUserPreferences();
  const queryClient = useQueryClient();
  const [changingStage, setChangingStage] = useState(false);
  const [savingStage, setSavingStage] = useState<LifeStage | null>(null);
  const [savingShareContext, setSavingShareContext] = useState(false);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const handleChangeLanguage = async (language: SupportedLanguage) => {
    setChangingLanguage(true);
    try {
      await setAppLanguage(language);
    } finally {
      setChangingLanguage(false);
    }
  };

  const handleToggleShareContext = async (value: boolean) => {
    if (!session?.user.id) return;
    setSavingShareContext(true);
    try {
      await updateAiShareHealthContext(session.user.id, value);
      await queryClient.invalidateQueries({ queryKey: ['user-preferences', session.user.id] });
    } finally {
      setSavingShareContext(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Sin esto, la próxima usuaria en el mismo dispositivo podría ver datos
    // cacheados de la sesión anterior (perfil, registros, etc.).
    queryClient.clear();
  };

  const handleChangeStage = async (stage: LifeStage) => {
    setSavingStage(stage);
    try {
      await setLifeStage(stage);
      // El Home lee useProfile() con la misma key — invalidar acá alcanza
      // para que se recomponga sin reiniciar la app.
      await queryClient.invalidateQueries({ queryKey: ['profile', session?.user.id] });
      setChangingStage(false);
    } finally {
      setSavingStage(null);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        {t('title')}
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        {session?.user.email}
      </Text>

      {isLoading ? (
        <Text variant="bodyMuted">{t('loading')}</Text>
      ) : isError ? (
        <Banner message={t('loadError')} tone="danger" />
      ) : (
        <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar initials={AVATAR_EMOJI[profile?.avatars?.code ?? ''] ?? '?'} size={64} />
            <View>
              <Text variant="body">
                {profile?.display_name ?? t('noNameYet')}
              </Text>
              <Text variant="bodyMuted">
                {profile?.avatars?.name_es ?? t('noAvatarChosen')}
              </Text>
            </View>
          </View>

          <View>
            <Text variant="caption">{t('lifeStageLabel')}</Text>
            <Text variant="body">
              {profile?.life_stage ? LIFE_STAGE_META[profile.life_stage].label : t('lifeStageUndefined')}
            </Text>
            <Button
              label={t('changeLifeStage')}
              variant="ghost"
              onPress={() => setChangingStage(true)}
            />
          </View>
        </View>
      )}

      <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
        <Text variant="caption">{t('privacyTitle')}</Text>
        {preferencesError ? <Banner tone="danger" message={t('privacyLoadError')} /> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Switch
            value={preferences?.ai_share_health_context ?? false}
            onValueChange={handleToggleShareContext}
            disabled={savingShareContext || !preferences}
            trackColor={{ true: colors.pitahaya }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="body">{t('aiShareLabel')}</Text>
            <Text variant="caption">
              {preferences?.ai_share_health_context
                ? t('aiShareOnDescription')
                : t('aiShareOffDescription')}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
        <Text variant="caption">{t('languageTitle')}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {SUPPORTED_LANGUAGES.map((language) => (
            <Chip
              key={language}
              label={t(LANGUAGE_LABEL_KEYS[language])}
              selected={i18n.language === language}
              onPress={() => handleChangeLanguage(language)}
            />
          ))}
        </View>
        {changingLanguage ? <Text variant="caption">{t('languageChanging')}</Text> : null}
      </View>

      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        <Button label={t('medicalSummary')} variant="secondary" onPress={() => router.push('/summary')} />
        <Button label={t('reminders')} variant="secondary" onPress={() => router.push('/reminders')} />
        <Button
          label={t('healthDirectory')}
          variant="secondary"
          onPress={() => router.push('/directory')}
        />
        <Button
          label={t('familyCircle')}
          variant="secondary"
          onPress={() => router.push('/family')}
        />
        <Button
          label={t('appointmentsAgenda')}
          variant="secondary"
          onPress={() => router.push('/appointments')}
        />
      </View>

      <Button label={t('signOut')} variant="secondary" onPress={handleSignOut} />
      </ScrollView>

      <Sheet visible={changingStage} onClose={() => setChangingStage(false)}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="heading">{t('changeLifeStagePrompt')}</Text>
          {LIFE_STAGES.map((stage) => (
            <Pressable
              key={stage}
              onPress={() => handleChangeStage(stage)}
              disabled={savingStage !== null}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.sm,
                opacity: savingStage && savingStage !== stage ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 24 }}>{LIFE_STAGE_META[stage].emoji}</Text>
              <Text variant="body">{LIFE_STAGE_META[stage].label}</Text>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
