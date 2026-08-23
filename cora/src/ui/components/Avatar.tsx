import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/ui/components/Text';
import { colors } from '@/ui/theme/tokens';

type AvatarProps = {
  uri?: string;
  initials?: string;
  size?: number;
};

export function Avatar({ uri, initials = '?', size = 48 }: AvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimensionStyle]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle]}>
      <Text style={{ color: colors.white, fontWeight: '700', fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.border,
  },
  fallback: {
    backgroundColor: colors.pitahaya,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
