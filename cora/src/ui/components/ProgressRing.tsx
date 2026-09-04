import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

type ProgressRingProps = PropsWithChildren<{
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color: string;
  trackColor: string;
}>;

// Mismo cálculo SVG que antes vivía inline en CycleStatusModule — extraído acá
// porque el Calendario lo necesita dos veces más (próximo período + ventana
// fértil), y triplicar la matemática de strokeDasharray/strokeDashoffset
// invitaba a que se desincronizaran entre sí.
export function ProgressRing({
  size = 76,
  strokeWidth = 8,
  progress,
  color,
  trackColor,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          fill="none"
        />
      </Svg>
      {children ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
