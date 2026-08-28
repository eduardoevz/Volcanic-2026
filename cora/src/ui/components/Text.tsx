import type { PropsWithChildren } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';

import { useTheme } from '@/ui/theme/ThemeContext';
import type { Typography } from '@/ui/theme/tokens';

type Variant = keyof Typography;

type TextProps = PropsWithChildren<{
  variant?: Variant;
  style?: TextStyle;
  numberOfLines?: number;
}>;

export function Text({ children, variant = 'body', style, numberOfLines }: TextProps) {
  const { typography } = useTheme();
  return (
    <RNText style={[typography[variant], style]} numberOfLines={numberOfLines}>
      {children}
    </RNText>
  );
}
