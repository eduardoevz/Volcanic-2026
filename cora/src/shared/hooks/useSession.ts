import { useSessionStore } from '@/store/sessionStore';

export function useSession() {
  const session = useSessionStore((state) => state.session);
  const status = useSessionStore((state) => state.status);
  const isPasswordRecovery = useSessionStore((state) => state.isPasswordRecovery);
  const setPasswordRecovery = useSessionStore((state) => state.setPasswordRecovery);
  return { session, status, isPasswordRecovery, setPasswordRecovery };
}
