import { View } from 'react-native';

import type { ChatMessage } from '@/features/assistant/hooks/useChat';
import { Card } from '@/ui/components/Card';
import { Text } from '@/ui/components/Text';
import { colors } from '@/ui/theme/tokens';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
      <Card style={{ backgroundColor: isUser ? colors.pitahaya : colors.white }}>
        <Text style={{ color: isUser ? colors.white : colors.charcoal }}>
          {message.content || (message.pending ? '…' : '')}
        </Text>
      </Card>
    </View>
  );
}
