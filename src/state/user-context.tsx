import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError, fetchProfile, type ProfileData } from '@/api';
import { useAuth } from './auth-context';

interface UserContextValue {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { token, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    fetchProfile(token)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.isUnauthorized) {
          signOut('Din session er udløbet. Log ind igen.');
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Kunne ikke hente profil.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, nonce, signOut]);

  const value = useMemo<UserContextValue>(
    () => ({ profile, loading, error, reload }),
    [profile, loading, error, reload],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
