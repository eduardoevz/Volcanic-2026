import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { useSession } from '@/shared/hooks/useSession';
import { Screen } from '@/ui/components/Screen';
import { colors } from '@/ui/theme/tokens';

export default function Index() {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <Screen padded={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.pitahaya} />
      </Screen>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
