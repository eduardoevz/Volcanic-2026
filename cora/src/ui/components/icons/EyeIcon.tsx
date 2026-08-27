import { Path, Svg } from 'react-native-svg';

import { colors } from '@/ui/theme/tokens';

type IconProps = {
  size?: number;
  color?: string;
};

export function EyeIcon({ size = 20, color = colors.charcoalMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeOffIcon({ size = 20, color = colors.charcoalMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.58 10.59a3 3 0 0 0 4.24 4.24"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.61 6.63C4.14 8.06 2 10.5 2 12s4 7 11 7c1.83 0 3.42-.34 4.78-.87M18.19 15.6C20.4 14.03 22 12 22 12s-4-7-11-7c-.55 0-1.08.03-1.6.1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
