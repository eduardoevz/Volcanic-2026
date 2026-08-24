import { useEffect } from 'react';
import { Modal, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { LEVEL_META, type MascotLevel } from '@/features/mascot/level';
import { useMascotEvolutionStore } from '@/store/mascotEvolutionStore';
import { Button } from '@/ui/components/Button';
import { Text } from '@/ui/components/Text';
import { colors, spacing } from '@/ui/theme/tokens';

// Montado una sola vez en app/_layout.tsx, igual que ErrorBoundary. Se activa
// desde cualquier pantalla de la app cuando checkMascotEvolution detecta que
// el nivel subió — no requiere que la usuaria esté en /mascot.
export function MascotEvolutionOverlay() {
  const level = useMascotEvolutionStore((state) => state.justEvolvedToLevel);
  const clear = useMascotEvolutionStore((state) => state.clear);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (level != null) {
      scale.value = withSpring(1, { damping: 7 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [level, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (level == null) return null;

  const meta = LEVEL_META[level as MascotLevel];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={clear}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(34,27,31,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.lg,
        }}
      >
        <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
          <Text style={{ fontSize: 110 }}>{meta.emoji}</Text>
          <Text
            variant="title"
            style={{ color: colors.white, textAlign: 'center', marginTop: spacing.md }}
          >
            ¡Tu pitahaya creció!
          </Text>
          <Text
            variant="body"
            style={{ color: colors.white, textAlign: 'center', marginTop: spacing.xs }}
          >
            {`Ahora es ${meta.name} · Nivel ${level}`}
          </Text>
          <Button label="Genial" onPress={clear} style={{ marginTop: spacing.lg }} />
        </Animated.View>
      </View>
    </Modal>
  );
}
