import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, Switch, View } from 'react-native';

import { signOut } from '@/features/auth';
import { AVATAR_EMOJI } from '@/features/avatars';
import { setLifeStage } from '@/features/onboarding';
import { updateAiShareHealthContext, useProfile, useUserPreferences } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import { LIFE_STAGES, LIFE_STAGE_META, type LifeStage } from '@/shared/constants/lifeStages';
import { Avatar } from '@/ui/components/Avatar';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Sheet } from '@/ui/components/Sheet';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

export default function Profile() {
  const { session } = useSession();
  const { data: profile, isLoading, isError } = useProfile();
  const { data: preferences } = useUserPreferences();
  const queryClient = useQueryClient();
  const [changingStage, setChangingStage] = useState(false);
  const [savingStage, setSavingStage] = useState<LifeStage | null>(null);
  const [savingShareContext, setSavingShareContext] = useState(false);

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
      <Text variant="title" style={{ marginBottom: spacing.sm }}>
        Perfil
      </Text>
      <Text variant="bodyMuted" style={{ marginBottom: spacing.md }}>
        {session?.user.email}
      </Text>

      {isLoading ? (
        <Text variant="bodyMuted">Cargando perfil...</Text>
      ) : isError ? (
        <Banner
          message="No pudimos cargar tu perfil. Revisá tu conexión e intentá de nuevo."
          tone="danger"
        />
      ) : (
        <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar initials={AVATAR_EMOJI[profile?.avatars?.code ?? ''] ?? '?'} size={64} />
            <View>
              <Text variant="body">
                {profile?.display_name ?? 'Sin nombre todavía'}
              </Text>
              <Text variant="bodyMuted">
                {profile?.avatars?.name_es ?? 'Sin avatar elegido'}
              </Text>
            </View>
          </View>

          <View>
            <Text variant="caption">Etapa de vida</Text>
            <Text variant="body">
              {profile?.life_stage ? LIFE_STAGE_META[profile.life_stage].label : 'Sin definir'}
            </Text>
            <Button
              label="Cambiar etapa"
              variant="ghost"
              onPress={() => setChangingStage(true)}
            />
          </View>
        </View>
      )}

      <View style={{ gap: spacing.xs, marginBottom: spacing.lg }}>
        <Text variant="caption">Privacidad</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Switch
            value={preferences?.ai_share_health_context ?? false}
            onValueChange={handleToggleShareContext}
            disabled={savingShareContext || !preferences}
            trackColor={{ true: colors.pitahaya }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="body">Compartir contexto con Cora IA</Text>
            <Text variant="caption">
              {preferences?.ai_share_health_context
                ? 'Cora puede usar agregados de tus registros (ciclo promedio, síntoma frecuente, ánimo) para responderte mejor. Nunca ve tus notas ni filas crudas.'
                : 'Apagado: Cora solo conoce tu etapa de vida y rango de edad, nunca tus registros.'}
            </Text>
          </View>
        </View>
      </View>

      <Button label="Cerrar sesión" variant="secondary" onPress={handleSignOut} />

      <Sheet visible={changingStage} onClose={() => setChangingStage(false)}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="heading">¿En qué etapa estás ahora?</Text>
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
