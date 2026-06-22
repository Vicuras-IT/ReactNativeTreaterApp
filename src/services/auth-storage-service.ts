/**
 * Persists the auth session and related flags between launches.
 *
 * Ported from the Flutter app's `lib/services/auth_storage_service.dart`, which
 * used `shared_preferences`. The Dart version is cross-platform (web + native),
 * so this port preserves that: it uses `expo-secure-store` on native (the token
 * is sensitive) and falls back to `localStorage` on web, where SecureStore is
 * unavailable.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from '@/services/auth-service';

const TOKEN_KEY = 'auth.token';
const LANGUAGE_KEY = 'auth.language';
const BIOMETRICS_ENABLED_KEY = 'auth.biometricsEnabled';
const ONBOARDING_COMPLETE_KEY = 'onboarding.complete';

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export class AuthStorageService {
  async loadSession(): Promise<AuthSession | null> {
    const token = await getItem(TOKEN_KEY);
    if (token === null || token.trim().length === 0) return null;

    return {
      token,
      language: (await getItem(LANGUAGE_KEY)) ?? 'da',
    };
  }

  async saveSession(session: AuthSession): Promise<void> {
    await setItem(TOKEN_KEY, session.token);
    await setItem(LANGUAGE_KEY, session.language);
  }

  async clearSession(): Promise<void> {
    await removeItem(TOKEN_KEY);
    await removeItem(LANGUAGE_KEY);
  }

  async loadBiometricsEnabled(): Promise<boolean> {
    return (await getItem(BIOMETRICS_ENABLED_KEY)) === 'true';
  }

  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await setItem(BIOMETRICS_ENABLED_KEY, enabled ? 'true' : 'false');
  }

  async loadOnboardingComplete(): Promise<boolean> {
    return (await getItem(ONBOARDING_COMPLETE_KEY)) === 'true';
  }

  async setOnboardingComplete(complete: boolean): Promise<void> {
    await setItem(ONBOARDING_COMPLETE_KEY, complete ? 'true' : 'false');
  }
}
