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

// Marca compartida entre los dos temas — no cambia con claro/oscuro.
// `onBrand` es el color de texto/ícono para superficies pintadas con un
// color de marca saturado (botón primario, chip seleccionado, avatar) —
// se mantiene claro en ambos temas porque esas superficies no invierten
// contraste como `cream`/`white`.
const brand = {
  pitahaya: '#C2185B',
  pitahayaLight: '#E91E86',
  pitahayaDark: '#8E0E44',
  stem: '#3E8E5A',
  onBrand: '#FFFFFF',
} as const;

// Mismas claves en ambos temas: los componentes leen `colors.X` sin saber
// cuál tema está activo. Por eso `white`/`cream` guardan una superficie
// oscura en el tema oscuro — el nombre describe el rol (superficie/fondo),
// no el color literal.
// Paleta propuesta por el usuario (2026-09-03): marfil cálido, rosa malva,
// terracota suave, amarillo mantequilla, verde salvia, marrón chocolate.
// Solo se aplica al tema claro — el oscuro se deja intacto a propósito, así
// que estos 4 sobreescriben lo heredado de `brand` únicamente aquí.
export const lightColors = {
  ...brand,
  pitahaya: '#B05B6F',
  pitahayaLight: '#D68F7A',
  pitahayaDark: '#7B404E',
  stem: '#74AC91',
  stemLight: '#C0DACE',
  cream: '#FAF3EA',
  charcoal: '#3E2723',
  charcoalMuted: '#958886',
  border: '#EBE3DA',
  white: '#FFFFFF',
  danger: '#C0392B',
  dangerLight: '#FBEAE8',
  warning: '#867C49',
  warningLight: '#F4E285',
  success: '#57816D',
  successLight: '#DCEAE4',
} as const;

export const darkColors = {
  ...brand,
  stemLight: '#1F3327',
  cream: '#171113',
  charcoal: '#F5EDF0',
  charcoalMuted: '#B8AEB2',
  border: '#3A2E33',
  white: '#241B1F',
  danger: '#E57368',
  dangerLight: '#3A1F1D',
  warning: '#D9A441',
  warningLight: '#3A2E15',
  success: '#4FAE78',
  successLight: '#1B3324',
} as const;

// Ancho a `string` (no los literales exactos de `lightColors`) para que
// `darkColors` — con los mismos nombres de clave pero otros valores — sea
// asignable al mismo tipo.
export type ColorScheme = Record<keyof typeof lightColors, string>;

// Relleno translúcido para "predicción" en el calendario (sombreado leve,
// a diferencia del relleno sólido de periodo confirmado) — se deriva del
// mismo `pitahaya` de cada tema en vez de un token fijo, para que cambie
// junto con la paleta clara/oscura.
export function predictedFill(colors: ColorScheme): string {
  return `${colors.pitahaya}26`; // ~15% de opacidad (hex alpha)
}

export function buildTypography(colors: ColorScheme) {
  return {
    title: { fontSize: 28, fontWeight: '700' as const, color: colors.charcoal },
    heading: { fontSize: 20, fontWeight: '700' as const, color: colors.charcoal },
    body: { fontSize: 16, fontWeight: '400' as const, color: colors.charcoal },
    bodyMuted: { fontSize: 16, fontWeight: '400' as const, color: colors.charcoalMuted },
    caption: { fontSize: 13, fontWeight: '400' as const, color: colors.charcoalMuted },
    button: { fontSize: 16, fontWeight: '600' as const, color: colors.onBrand },
  };
}

export function buildShadows(colors: ColorScheme) {
  return {
    card: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  };
}

export type Typography = ReturnType<typeof buildTypography>;
export type Shadows = ReturnType<typeof buildShadows>;
