import { REQUEST_TIMEOUT_MS } from './config';

/** Raised when a request completes with a non-2xx status. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly url: string;
  readonly body: string;

  constructor(message: string, statusCode: number, url: string, body = '') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.url = url;
    this.body = body;
  }

  /** Token rejected / session expired — callers use this to force a logout. */
  get isUnauthorized(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function withTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Forespørgslen tog for lang tid.', 0, url);
    }
    throw new ApiError(
      'Kunne ikke oprette forbindelse til serveren.',
      0,
      url,
    );
  } finally {
    clearTimeout(timer);
  }
}

async function readBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function ensureOk(res: Response, body: string, url: string): void {
  if (res.status < 200 || res.status >= 300) {
    throw new ApiError(
      `Request to ${url} failed with status ${res.status}`,
      res.status,
      url,
      body,
    );
  }
}

function parseJson<T>(body: string, url: string): T {
  if (!body.trim()) return null as T;
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new ApiError('Uventet svar fra serveren.', 0, url, body);
  }
}

/** Authenticated GET returning parsed JSON. */
export async function getJson<T>(
  url: string,
  token?: string,
): Promise<T> {
  const res = await withTimeout(url, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const body = await readBody(res);
  ensureOk(res, body, url);
  return parseJson<T>(body, url);
}

/** POST a JSON body. `token` optional for the unauthenticated login call. */
export async function postJson<T>(
  url: string,
  payload: unknown,
  token?: string,
): Promise<{ data: T; raw: string }> {
  const res = await withTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  const body = await readBody(res);
  ensureOk(res, body, url);
  return { data: parseJson<T>(body, url), raw: body };
}

/** Append query params to a URL, dropping null/undefined values. */
export function withQuery(
  url: string,
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && `${value}`.length > 0) {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}
