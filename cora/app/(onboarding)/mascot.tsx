import { useEffect } from 'react';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { OnboardingProgress } from '@/features/onboarding';
import { Button } from '@/ui/components/Button';
import { Screen } from '@/ui/components/Screen';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

export default function MascotScreen() {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
      <OnboardingProgress step={4} />
      <Animated.Text style={[{ fontSize: 96, marginVertical: spacing.lg }, animatedStyle]}>
        🐉
      </Animated.Text>
      <Text variant="title" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
        Conocé a tu pitahaya
      </Text>
      <Text variant="bodyMuted" style={{ textAlign: 'center', marginBottom: spacing.lg }}>
        Crece con cada momento de cuidado que registrés — sin castigos ni rachas. Nunca baja
        de nivel.
      </Text>
      <Button label="Continuar" onPress={() => router.push('/(onboarding)/consent')} />
    </Screen>
  );
}
