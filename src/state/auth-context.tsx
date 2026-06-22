/**
 * Application auth orchestration.
 *
 * Ports the session lifecycle that lived in the Flutter app's `main.dart`
 * (`_TreaterAppState`): restoring a saved session on launch, handling login /
 * biometric login / logout, persisting the session, and loading the user
 * profile into {@link UserState}.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { AuthService, type AuthSession } from '@/services/auth-service';
import { AuthStorageService } from '@/services/auth-storage-service';
import { BiometricAuthService } from '@/services/biometric-auth-service';
import { ProfileDataService } from '@/services/profile-data-service';
import { ApiRequestException } from '@/services/api-transport';
import { useUserState } from '@/state/user-state';

export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  language: string;
  onboardingComplete: boolean;
  /** Last logout/login message to surface on the login screen. */
  message: string | null;

  login: (username: string, password: string) => Promise<void>;
  biometricLogin: () => Promise<void>;
  logout: (message?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export interface AuthServices {
  authService: AuthService;
  authStorageService: AuthStorageService;
  biometricAuthService: BiometricAuthService;
  profileDataService: ProfileDataService;
}

const defaultServices: AuthServices = {
  authService: new AuthService(),
  authStorageService: new AuthStorageService(),
  biometricAuthService: new BiometricAuthService(),
  profileDataService: new ProfileDataService(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  services = defaultServices,
}: {
  children: ReactNode;
  services?: AuthServices;
}) {
  const { authService, authStorageService, biometricAuthService, profileDataService } = services;
  const userState = useUserState();

  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState('da');
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Guards against stale profile loads racing a logout (mirrors the Dart
  // `_userLoadGeneration` counter).
  const loadGeneration = useRef(0);

  const loadUserProfile = useCallback(
    async (sessionToken: string) => {
      const generation = ++loadGeneration.current;
      userState.beginLoading();
      try {
        const profile = await profileDataService.load(sessionToken);
        if (generation !== loadGeneration.current) return;
        userState.setProfile(profile);
      } catch (error) {
        if (generation !== loadGeneration.current) return;
        userState.setLoadError(error);
      }
    },
    [profileDataService, userState],
  );

  // Restore a persisted session on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await authStorageService.loadSession();
      const completed = await authStorageService.loadOnboardingComplete();
      if (cancelled) return;

      setOnboardingComplete(completed);
      if (session) {
        setToken(session.token);
        setLanguage(session.language);
        setStatus('authenticated');
        loadUserProfile(session.token);
      } else {
        setStatus('unauthenticated');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySession = useCallback(
    async (session: AuthSession) => {
      await authStorageService.saveSession(session);
      setToken(session.token);
      setLanguage(session.language);
      setMessage(null);
      setStatus('authenticated');
      loadUserProfile(session.token);
    },
    [authStorageService, loadUserProfile],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const session = await authService.login({ username: username.trim(), password });
      await applySession(session);
    },
    [authService, applySession],
  );

  const biometricLogin = useCallback(async () => {
    const authenticated = await biometricAuthService.authenticate();
    if (!authenticated) return;
    const session = await authStorageService.loadSession();
    if (!session) {
      throw new ApiRequestException('Log ind med email og adgangskode først.');
    }
    await applySession(session);
  }, [biometricAuthService, authStorageService, applySession]);

  const logout = useCallback(
    async (logoutMessage?: string) => {
      loadGeneration.current++;
      userState.clear();
      await authStorageService.clearSession();
      setToken(null);
      setMessage(logoutMessage ?? null);
      setStatus('unauthenticated');
    },
    [authStorageService, userState],
  );

  const completeOnboarding = useCallback(async () => {
    await authStorageService.setOnboardingComplete(true);
    setOnboardingComplete(true);
  }, [authStorageService]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      language,
      onboardingComplete,
      message,
      login,
      biometricLogin,
      logout,
      completeOnboarding,
    }),
    [status, token, language, onboardingComplete, message, login, biometricLogin, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}
