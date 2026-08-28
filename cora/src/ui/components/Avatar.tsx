import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { useTheme } from '@/ui/theme/ThemeContext';
import type { ColorScheme } from '@/ui/theme/tokens';

type AvatarProps = {
  uri?: string;
  initials?: string;
  size?: number;
};

function buildStyles(colors: ColorScheme) {
  return StyleSheet.create({
    image: {
      backgroundColor: colors.border,
    },
    fallback: {
      backgroundColor: colors.pitahaya,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function Avatar({ uri, initials = '?', size = 48 }: AvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimensionStyle]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle]}>
      <Text style={{ color: colors.onBrand, fontWeight: '700', fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
}
