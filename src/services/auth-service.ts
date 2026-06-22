/**
 * Authentication service.
 *
 * Ported from the Flutter app's `lib/services/auth_service.dart`. Performs the
 * login request and normalises the various token/response shapes the backend
 * may return into an {@link AuthSession}.
 */
import { postJson } from '@/services/api-transport';
import { loginUrl } from '@/lib/urls';

export interface AuthSession {
  readonly token: string;
  readonly language: string;
}

const EMPTY_SESSION: AuthSession = { token: '', language: 'da' };

function normalizeLanguage(value: unknown): string {
  if (typeof value !== 'string') return 'da';
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case 'engelsk':
    case 'english':
    case 'en':
      return 'en';
    case 'dansk':
    case 'danish':
    case 'da':
      return 'da';
    default:
      return 'da';
  }
}

function extractTokenFromMap(decoded: Record<string, unknown>): string {
  for (const key of ['token', 'access_token', 'bearerToken', 'bearer']) {
    const value = decoded[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
}

function extractSession(rawBody: string): AuthSession {
  const trimmed = rawBody.trim();
  if (trimmed.length === 0) return EMPTY_SESSION;

  let decoded: unknown;
  try {
    decoded = JSON.parse(trimmed);
  } catch {
    // Not JSON — treat the body as a bare token, stripping any "Bearer " prefix.
    return {
      token: trimmed.replace(/^Bearer\s+/i, ''),
      language: 'da',
    };
  }

  if (typeof decoded === 'string') {
    return { token: decoded, language: 'da' };
  }
  if (decoded !== null && typeof decoded === 'object') {
    const map = decoded as Record<string, unknown>;
    return {
      token: extractTokenFromMap(map),
      language: normalizeLanguage(map.language),
    };
  }

  return EMPTY_SESSION;
}

export class AuthService {
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<AuthSession> {
    const rawBody = await postJson(loginUrl, {
      username,
      password,
      secret: 'Mellon',
    });

    const session = extractSession(rawBody);
    if (session.token.length === 0) {
      throw new Error('Login succeeded, but no bearer token was returned.');
    }
    return session;
  }

  authorizationHeader(token: string): string {
    return `Bearer ${token}`;
  }
}
