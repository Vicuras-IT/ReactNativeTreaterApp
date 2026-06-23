import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TabKey = 'home' | 'calendar' | 'tasks' | 'forum' | 'profile';

export type OverlayKey =
  | 'order-materials'
  | 'notifications'
  | 'treatment-guide'
  | 'medals'
  | 'onboarding';

export interface Overlay {
  key: OverlayKey;
  params?: Record<string, unknown>;
}

/** The calendar can open directly on the day view (from "Se dagens aftaler"). */
export type CalendarView = 'month' | 'day';

interface NavContextValue {
  tab: TabKey;
  overlays: Overlay[];
  calendarView: CalendarView;
  setTab: (tab: TabKey) => void;
  pushOverlay: (overlay: Overlay) => void;
  popOverlay: () => void;
  openTodaysProgram: () => void;
  openOrderMaterials: () => void;
  openNotifications: () => void;
  openTreatmentGuide: (params?: Record<string, unknown>) => void;
  openMedals: () => void;
  openOnboarding: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<TabKey>('home');
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [calendarView, setCalendarView] = useState<CalendarView>('month');

  const setTab = useCallback((next: TabKey) => {
    setOverlays([]);
    setCalendarView('month');
    setTabState(next);
  }, []);

  const pushOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay]);
  }, []);

  const popOverlay = useCallback(() => {
    setOverlays((prev) => prev.slice(0, -1));
  }, []);

  const openTodaysProgram = useCallback(() => {
    setOverlays([]);
    setCalendarView('day');
    setTabState('calendar');
  }, []);

  const openOrderMaterials = useCallback(
    () => pushOverlay({ key: 'order-materials' }),
    [pushOverlay],
  );
  const openNotifications = useCallback(
    () => pushOverlay({ key: 'notifications' }),
    [pushOverlay],
  );
  const openTreatmentGuide = useCallback(
    (params?: Record<string, unknown>) =>
      pushOverlay({ key: 'treatment-guide', params }),
    [pushOverlay],
  );
  const openMedals = useCallback(
    () => pushOverlay({ key: 'medals' }),
    [pushOverlay],
  );
  const openOnboarding = useCallback(
    () => pushOverlay({ key: 'onboarding' }),
    [pushOverlay],
  );

  const value = useMemo<NavContextValue>(
    () => ({
      tab,
      overlays,
      calendarView,
      setTab,
      pushOverlay,
      popOverlay,
      openTodaysProgram,
      openOrderMaterials,
      openNotifications,
      openTreatmentGuide,
      openMedals,
      openOnboarding,
    }),
    [
      tab,
      overlays,
      calendarView,
      setTab,
      pushOverlay,
      popOverlay,
      openTodaysProgram,
      openOrderMaterials,
      openNotifications,
      openTreatmentGuide,
      openMedals,
      openOnboarding,
    ],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within a NavigationProvider');
  return ctx;
}
