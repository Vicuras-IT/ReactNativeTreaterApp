import { StyleSheet, View } from 'react-native';

import { DesignBackground } from '@/components/ui';
import { useNav } from '@/state/navigation-context';
import { useToast } from '@/components/ui';
import { HomeScreen } from '@/screens/home-screen';
import { CalendarScreen } from '@/screens/calendar-screen';
import { TasksScreen } from '@/screens/tasks-screen';
import { ForumScreen } from '@/screens/forum-screen';
import { ProfileScreen } from '@/screens/profile-screen';
import { OrderMaterialsScreen } from '@/screens/order-materials-screen';
import { NotificationsScreen } from '@/screens/notifications-screen';
import { TreatmentGuideScreen } from '@/screens/treatment-guide-screen';
import { MedalsScreen } from '@/screens/medals-screen';
import { OnboardingScreen } from '@/screens/onboarding-screen';
import { BottomNav } from './bottom-nav';
import { QuickActionFab } from './quick-action-fab';

export function AppShell() {
  const nav = useNav();
  const toast = useToast();
  const hasOverlay = nav.overlays.length > 0;

  const tabScreen = () => {
    switch (nav.tab) {
      case 'home':
        return <HomeScreen />;
      case 'calendar':
        return <CalendarScreen initialView={nav.calendarView} />;
      case 'tasks':
        return <TasksScreen />;
      case 'forum':
        return <ForumScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  const renderOverlay = (key: string, params?: Record<string, unknown>) => {
    switch (key) {
      case 'order-materials':
        return <OrderMaterialsScreen onBack={nav.popOverlay} />;
      case 'notifications':
        return <NotificationsScreen onBack={nav.popOverlay} />;
      case 'treatment-guide':
        return <TreatmentGuideScreen onBack={nav.popOverlay} params={params} />;
      case 'medals':
        return <MedalsScreen onBack={nav.popOverlay} />;
      case 'onboarding':
        return <OnboardingScreen onBack={nav.popOverlay} />;
      default:
        return null;
    }
  };

  return (
    <DesignBackground>
      <View style={styles.fill}>{tabScreen()}</View>

      {!hasOverlay ? (
        <>
          <BottomNav active={nav.tab} onChange={nav.setTab} />
          <QuickActionFab
            actions={[
              {
                icon: 'inventory_2',
                label: 'Materiale­bestilling',
                onPress: nav.openOrderMaterials,
              },
              {
                icon: 'add_task',
                label: 'Ekstra arbejde',
                onPress: () => toast.show('Registrering af ekstra arbejde'),
              },
              {
                icon: 'healing',
                label: 'Fravær',
                onPress: () => toast.show('Meld fravær'),
              },
            ]}
          />
        </>
      ) : null}

      {nav.overlays.map((overlay, index) => (
        <View
          key={`${overlay.key}-${index}`}
          style={StyleSheet.absoluteFill}>
          {renderOverlay(overlay.key, overlay.params)}
        </View>
      ))}
    </DesignBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
