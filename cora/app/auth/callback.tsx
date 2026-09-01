import { Redirect } from 'expo-router';

// Respaldo para cora://auth/callback: en el camino normal,
// WebBrowser.openAuthSessionAsync (src/features/auth/api.ts#signInWithGoogle)
// intercepta ese deep link directamente y resuelve la promesa en memoria, sin
// pasar nunca por esta pantalla. Esta ruta solo se alcanza si esa
// intercepción falla y el sistema operativo reabre la app en frío con el
// deep link — antes de esto no existía ninguna ruta para
// "auth/callback" y expo-router caía a "Unmatched Route". app/index.tsx ya
// resuelve a dónde ir según el estado real de sesión.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
