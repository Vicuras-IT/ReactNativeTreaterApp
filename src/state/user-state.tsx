/**
 * Holds the loaded treater profile and its loading/error status.
 *
 * Ported from the Flutter app's `lib/state/user_state.dart` (a ChangeNotifier
 * exposed via an InheritedNotifier). Here it is a React context that exposes
 * the same derived getters (greetingName, initials, …).
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { profileInitials, type ProfileData } from '@/models/profile-data';

export interface UserState {
  profile: ProfileData | null;
  isLoading: boolean;
  loadError: unknown;

  // Derived values, mirroring the Dart getters.
  fullName: string;
  greetingName: string;
  initials: string;
  primaryEmail: string;
  mobilePhone: string;
  address: string;
  pictureBase64: string | null;

  beginLoading: () => void;
  setProfile: (profile: ProfileData) => void;
  setLoadError: (error: unknown) => void;
  clear: () => void;
}

const UserStateContext = createContext<UserState | null>(null);

export function UserStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadErrorState] = useState<unknown>(null);

  const value = useMemo<UserState>(() => {
    const fullName = profile?.fullName.trim() ?? '';
    return {
      profile,
      isLoading,
      loadError,
      fullName,
      greetingName: fullName.length === 0 ? 'dig' : fullName,
      initials: profile ? profileInitials(profile.fullName) : 'VC',
      primaryEmail: profile?.primaryEmail ?? '',
      mobilePhone: profile?.mobilePhone ?? '',
      address: profile?.address ?? '',
      pictureBase64: profile?.pictureBase64 ?? null,
      beginLoading: () => {
        setIsLoading(true);
        setLoadErrorState(null);
      },
      setProfile: (next: ProfileData) => {
        setProfileState(next);
        setIsLoading(false);
        setLoadErrorState(null);
      },
      setLoadError: (error: unknown) => {
        setIsLoading(false);
        setLoadErrorState(error);
      },
      clear: () => {
        setProfileState(null);
        setIsLoading(false);
        setLoadErrorState(null);
      },
    };
  }, [profile, isLoading, loadError]);

  return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>;
}

export function useUserState(): UserState {
  const state = useContext(UserStateContext);
  if (state === null) {
    throw new Error('useUserState must be used within a UserStateProvider.');
  }
  return state;
}
