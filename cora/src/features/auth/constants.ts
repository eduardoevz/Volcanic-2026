export const GOOGLE_OAUTH_REDIRECT_URL = 'cora://auth/callback';
// (auth) es un grupo de rutas de expo-router (paréntesis): no aparece en la
// URL. El deep link real que resuelve a app/(auth)/reset-password.tsx es
// cora://reset-password, no cora://auth/reset-password.
export const PASSWORD_RESET_REDIRECT_URL = 'cora://reset-password';
