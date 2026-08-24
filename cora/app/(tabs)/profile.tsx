import { useQueryClient } from '@tanstack/react-query';

import { signOut } from '@/features/auth';
import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import { Banner } from '@/ui/components/Banner';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function Profile() {
  const { session } = useSession();
  const { data: profile, isLoading, isError } = useProfile();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    // Sin esto, la próxima usuaria en el mismo dispositivo podría ver datos
    // cacheados de la sesión anterior (perfil, registros, etc.).
    queryClient.clear();
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
        <Text variant="body" style={{ marginBottom: spacing.lg }}>
          {profile?.display_name ?? 'Sin nombre todavía (llega en la Fase 3)'}
        </Text>
      )}
      <Button label="Cerrar sesión" variant="secondary" onPress={handleSignOut} />
    </Screen>
  );
}
