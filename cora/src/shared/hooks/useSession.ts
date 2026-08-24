import { useSessionStore } from '@/store/sessionStore';

export function useSession() {
  const session = useSessionStore((state) => state.session);
  const status = useSessionStore((state) => state.status);
  return { session, status };
}
