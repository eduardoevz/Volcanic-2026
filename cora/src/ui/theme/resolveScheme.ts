export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorSchemeName = string | null | undefined;

export function resolveScheme(mode: ThemeMode, systemScheme: ColorSchemeName): 'light' | 'dark' {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}
