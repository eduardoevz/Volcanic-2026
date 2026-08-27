import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HOME_LAYOUT, MODULES } from '@/features/home/moduleRegistry';
import { useProfile } from '@/features/profile';
import { Banner } from '@/ui/components/Banner';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Home() {
  const { t } = useTranslation('home');
  const { data: profile, isLoading, isError } = useProfile();

  if (isError && !profile) {
    return (
      <Screen>
        <Banner tone="danger" message={t('loadError')} />
      </Screen>
    );
  }

  if (isLoading || !profile?.life_stage) {
    return (
      <Screen>
        <Text variant="bodyMuted">{t('loading')}</Text>
      </Screen>
    );
  }

  // Una sola implementación para las 5 etapas — la etapa es un dato que decide
  // qué módulos componer, nunca una rama de código (§13 del plan).
  const moduleIds = HOME_LAYOUT[profile.life_stage];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}>
        <HomeHeader
          displayName={profile.display_name}
          lifeStage={profile.life_stage}
          avatarCode={profile.avatars?.code ?? null}
        />
        {moduleIds.map((id) => {
          const ModuleComponent = MODULES[id];
          return <ModuleComponent key={id} />;
        })}
      </ScrollView>
    </Screen>
  );
}
