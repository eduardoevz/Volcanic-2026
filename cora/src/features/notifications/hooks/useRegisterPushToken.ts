import { useEffect } from 'react';

import { useSession } from '@/shared/hooks/useSession';
import { registerForPushNotifications, subscribeToPushTokenRotation } from '@/features/notifications/pushTokens';

/**
 * Se llama una vez desde app/_layout.tsx. Solo con sesión activa: sin
 * userId no hay a quién asociarle el token (RLS de device_push_tokens
 * exige auth.uid() = user_id).
 */
export function useRegisterPushToken(): void {
  const { session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    registerForPushNotifications(userId);
    return subscribeToPushTokenRotation(userId);
  }, [userId]);
}
