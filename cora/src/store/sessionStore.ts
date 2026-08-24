import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionState = {
  session: Session | null;
  status: SessionStatus;
  setSession: (session: Session | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  status: 'loading',
  setSession: (session) => set({ session, status: session ? 'signedIn' : 'signedOut' }),
}));

let listenerStarted = false;

export function initSessionListener() {
  if (listenerStarted) return;
  listenerStarted = true;

  supabase.auth.getSession().then(({ data }) => {
    useSessionStore.getState().setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useSessionStore.getState().setSession(session);
  });
}
