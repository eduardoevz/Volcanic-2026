export const colors = {
  pitahaya: '#C2185B',
  pitahayaLight: '#E91E86',
  pitahayaDark: '#8E0E44',
  stem: '#3E8E5A',
  stemLight: '#DDF0E3',
  cream: '#FFF8F2',
  charcoal: '#221B1F',
  charcoalMuted: '#6B6266',
  border: '#EBDFE3',
  white: '#FFFFFF',
  danger: '#C0392B',
  dangerLight: '#FBEAE8',
  warning: '#B8860B',
  warningLight: '#FBF3DD',
  success: '#2E7D4F',
  successLight: '#E4F4EA',
} as const;

// Escala de 4px, ver docs/CONVENCIONES.md
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.charcoal },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.charcoal },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.charcoal },
  bodyMuted: { fontSize: 16, fontWeight: '400' as const, color: colors.charcoalMuted },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.charcoalMuted },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.white },
};

export const shadows = {
  card: {
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const theme = { colors, spacing, radii, typography, shadows };

export type Theme = typeof theme;
