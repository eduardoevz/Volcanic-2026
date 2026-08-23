import type { PropsWithChildren } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';

import { typography } from '@/ui/theme/tokens';

type Variant = keyof typeof typography;

type TextProps = PropsWithChildren<{
  variant?: Variant;
  style?: TextStyle;
  numberOfLines?: number;
}>;

export function Text({ children, variant = 'body', style, numberOfLines }: TextProps) {
  return (
    <RNText style={[typography[variant], style]} numberOfLines={numberOfLines}>
      {children}
    </RNText>
  );
}
