import { Endpoints, LOGIN_SECRET } from './config';
import { ApiError, postJson } from './client';
import { asObject } from './_util';
import type { AuthSession } from './types';

/** Normalise a server language value to our 'da' | 'en'. */
function normaliseLanguage(value: unknown): string {
  if (typeof value !== 'string') return 'da';
  const v = value.trim().toLowerCase();
  if (['en', 'english', 'engelsk'].includes(v)) return 'en';
  if (['da', 'danish', 'dansk'].includes(v)) return 'da';
  return 'da';
}

function stripBearer(token: string): string {
  const t = token.trim();
  return t.toLowerCase().startsWith('bearer ') ? t.slice(7).trim() : t;
}

function extractTokenFromMap(map: Record<string, unknown>): string {
  for (const key of ['token', 'access_token', 'bearerToken', 'bearer']) {
    const value = map[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
}

/**
 * Authenticate against /api/treater/login.
 * The response is either a bare token string or a JSON object carrying the
 * token under one of several keys (token / access_token / bearerToken / bearer)
 * plus an optional `language`.
 */
export async function login(
  username: string,
  password: string,
): Promise<AuthSession> {
  const { data, raw } = await postJson<unknown>(Endpoints.login, {
    username,
    password,
    secret: LOGIN_SECRET,
  });

  let token = '';
  let language = 'da';

  const map = asObject(data);
  if (map) {
    token = stripBearer(extractTokenFromMap(map));
    language = normaliseLanguage(map.language);
  } else if (typeof data === 'string') {
    token = stripBearer(data);
  } else {
    // Body may have been a quoted/plain string the JSON parser left as raw.
    token = stripBearer(raw.replace(/^"|"$/g, ''));
  }

  if (!token) {
    throw new ApiError(
      'Login lykkedes, men der blev ikke returneret et token.',
      0,
      Endpoints.login,
    );
  }

  return { token, language };
}
