import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from 'react-native';

import { resolveScheme, type ThemeMode } from './resolveScheme';
import {
  buildShadows,
  buildTypography,
  darkColors,
  lightColors,
  radii,
  spacing,
  type ColorScheme,
  type Shadows,
  type Typography,
} from './tokens';

const THEME_STORAGE_KEY = 'cora-theme';
const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  colors: ColorScheme;
  typography: Typography;
  shadows: Shadows;
  spacing: typeof spacing;
  radii: typeof radii;
  setAppTheme: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && (THEME_MODES as readonly string[]).includes(saved)) {
        setMode(saved as ThemeMode);
      }
    });
  }, []);

  const scheme = resolveScheme(mode, systemScheme);
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const typography = useMemo(() => buildTypography(colors), [colors]);
  const shadows = useMemo(() => buildShadows(colors), [colors]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.cream);
  }, [colors]);

  const setAppTheme = async (nextMode: ThemeMode) => {
    setMode(nextMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, scheme, colors, typography, shadows, spacing, radii, setAppTheme }),
    [mode, scheme, colors, typography, shadows],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return ctx;
}
