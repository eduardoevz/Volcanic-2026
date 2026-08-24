import { useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Switch, View } from 'react-native';

import { checkMascotEvolution } from '@/features/mascot';
import { completeOnboarding, OnboardingProgress } from '@/features/onboarding';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

export default function ConsentScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiShareHealthContext, setAiShareHealthContext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();
  const queryClient = useQueryClient();

  const handleAccept = async () => {
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding({ notificationsEnabled, aiShareHealthContext });
      await queryClient.invalidateQueries({ queryKey: ['profile', session?.user.id] });
      if (session?.user.id) await checkMascotEvolution(queryClient, session.user.id);
      router.replace('/(tabs)/home');
    } catch {
      setError('No pudimos guardar tus preferencias. Probá de nuevo.');
      setSaving(false);
    }
  };

  return (
    <Screen>
      <OnboardingProgress step={5} />
      <Text variant="title" style={{ marginBottom: spacing.md }}>
        Privacidad y Cora IA
      </Text>

      {error ? <Banner message={error} tone="danger" /> : null}

      <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: colors.pitahaya }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="body">Notificaciones</Text>
            <Text variant="caption">Recordatorios suaves de autocuidado.</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Switch
            value={aiShareHealthContext}
            onValueChange={setAiShareHealthContext}
            trackColor={{ true: colors.pitahaya }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="body">Compartir contexto con Cora IA</Text>
            <Text variant="caption">
              Apagado por defecto. Si lo activás, la IA puede usar tus registros para
              responderte mejor — nunca sin este permiso.
            </Text>
          </View>
        </View>
      </View>

      <Banner
        message="Cora no diagnostica ni sustituye atención médica."
        tone="info"
      />

      <Button
        label="Aceptar y continuar"
        onPress={handleAccept}
        loading={saving}
        style={{ marginTop: spacing.lg }}
      />
    </Screen>
  );
}
