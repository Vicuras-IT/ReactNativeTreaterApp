import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { login as apiLogin, type AuthSession } from '@/api';

const KEY_TOKEN = 'auth.token';
const KEY_LANGUAGE = 'auth.language';
const KEY_ONBOARDING = 'onboarding.complete';
const KEY_BIOMETRICS = 'auth.biometricsEnabled';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  language: string;
  onboardingComplete: boolean;
  biometricsEnabled: boolean;
  /** A message to surface on the login screen (e.g. after a forced logout). */
  loginMessage: string | null;
  /** True if a saved session exists — enables biometric re-auth. */
  hasSavedSession: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  resumeSavedSession: () => Promise<boolean>;
  signOut: (message?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState('da');
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [biometricsEnabled, setBiometricsState] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Restore any persisted session on launch.
  useEffect(() => {
    let active = true;
    (async () => {
      const [savedToken, savedLang, onboarding, bio] = await Promise.all([
        safeGet(KEY_TOKEN),
        safeGet(KEY_LANGUAGE),
        safeGet(KEY_ONBOARDING),
        safeGet(KEY_BIOMETRICS),
      ]);
      if (!active) return;
      setLanguage(savedLang ?? 'da');
      setOnboardingComplete(onboarding !== 'false');
      setBiometricsState(bio === 'true');
      if (savedToken && savedToken.trim().length > 0) {
        setHasSavedSession(true);
        setToken(savedToken);
        setStatus('authenticated');
      } else {
        setStatus('unauthenticated');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback(async (session: AuthSession) => {
    await Promise.all([
      SecureStore.setItemAsync(KEY_TOKEN, session.token),
      SecureStore.setItemAsync(KEY_LANGUAGE, session.language),
    ]);
  }, []);

  const applySession = useCallback(
    async (session: AuthSession) => {
      await persistSession(session);
      setToken(session.token);
      setLanguage(session.language);
      setHasSavedSession(true);
      setLoginMessage(null);
      setStatus('authenticated');
    },
    [persistSession],
  );

  const signIn = useCallback(
    async (username: string, password: string) => {
      const session = await apiLogin(username, password);
      await applySession(session);
    },
    [applySession],
  );

  // Re-activate the persisted token (used after a biometric prompt succeeds).
  const resumeSavedSession = useCallback(async () => {
    const saved = await safeGet(KEY_TOKEN);
    if (!saved) return false;
    setToken(saved);
    setStatus('authenticated');
    setLoginMessage(null);
    return true;
  }, []);

  const signOut = useCallback(async (message?: string) => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEY_TOKEN),
      SecureStore.deleteItemAsync(KEY_LANGUAGE),
    ]);
    setToken(null);
    setHasSavedSession(false);
    setLoginMessage(message ?? null);
    setStatus('unauthenticated');
  }, []);

  const completeOnboarding = useCallback(async () => {
    await SecureStore.setItemAsync(KEY_ONBOARDING, 'true');
    setOnboardingComplete(true);
  }, []);

  const setBiometricsEnabled = useCallback(async (enabled: boolean) => {
    await SecureStore.setItemAsync(KEY_BIOMETRICS, enabled ? 'true' : 'false');
    setBiometricsState(enabled);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      language,
      onboardingComplete,
      biometricsEnabled,
      loginMessage,
      hasSavedSession,
      signIn,
      resumeSavedSession,
      signOut,
      completeOnboarding,
      setBiometricsEnabled,
    }),
    [
      status,
      token,
      language,
      onboardingComplete,
      biometricsEnabled,
      loginMessage,
      hasSavedSession,
      signIn,
      resumeSavedSession,
      signOut,
      completeOnboarding,
      setBiometricsEnabled,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
