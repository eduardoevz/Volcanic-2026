import { View } from 'react-native';

import { AVATAR_EMOJI } from '@/features/avatars';
import type { LifeStage } from '@/shared/constants/lifeStages';
import { tStage } from '@/shared/utils/tStage';
import { Avatar } from '@/ui/components/Avatar';
import { Text } from '@/ui/components/Text';
import { spacing } from '@/ui/theme/tokens';

type HomeHeaderProps = {
  displayName: string | null;
  lifeStage: LifeStage;
  avatarCode: string | null;
};

export function HomeHeader({ displayName, lifeStage, avatarCode }: HomeHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      {avatarCode ? (
        <Avatar initials={AVATAR_EMOJI[avatarCode] ?? '🐾'} size={56} />
      ) : (
        <Avatar initials="?" size={56} />
      )}
      <View>
        <Text variant="title">{tStage('home.greeting', lifeStage)}</Text>
        {displayName ? <Text variant="bodyMuted">{displayName}</Text> : null}
      </View>
    </View>
  );
}
