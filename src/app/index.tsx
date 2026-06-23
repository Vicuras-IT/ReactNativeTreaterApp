import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DesignBackground } from '@/components/ui';
import { AppShell } from '@/components/shell/app-shell';
import { LoginScreen } from '@/screens/login-screen';
import { OnboardingScreen } from '@/screens/onboarding-screen';
import { Colors } from '@/theme';
import { useAuth } from '@/state/auth-context';

export default function Index() {
  const { status, onboardingComplete, completeOnboarding } = useAuth();

  if (status === 'loading') {
    return (
      <DesignBackground>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.pink} size="large" />
        </View>
      </DesignBackground>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginScreen />;
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onBack={completeOnboarding} />;
  }

  return <AppShell />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
