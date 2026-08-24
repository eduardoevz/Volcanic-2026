import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { useProfile } from '@/features/profile';
import { useSession } from '@/shared/hooks/useSession';
import { Screen } from '@/ui/components/Screen';
import { colors } from '@/ui/theme/tokens';

export default function Index() {
  const { status } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (status === 'loading' || (status === 'signedIn' && profileLoading)) {
    return (
      <Screen padded={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.pitahaya} />
      </Screen>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.onboarding_completed_at) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
