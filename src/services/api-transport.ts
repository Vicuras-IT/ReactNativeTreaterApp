/**
 * HTTP transport for the Vicuras backend.
 *
 * Ported from the Flutter app's `lib/api_transport*.dart`. Flutter needed
 * platform-specific implementations (`dart:io` vs `dart:html`); in React
 * Native a single `fetch`-based implementation works on iOS, Android and web,
 * so the platform split collapses into this one module.
 *
 * Both helpers return the raw response body as a string (matching the Dart
 * API), leaving JSON decoding to the caller.
 */

export class ApiRequestException extends Error {
  readonly statusCode?: number;
  readonly uri?: string;

  constructor(message: string, options: { statusCode?: number; uri?: string } = {}) {
    super(message);
    this.name = 'ApiRequestException';
    this.statusCode = options.statusCode;
    this.uri = options.uri;
    // Restore the prototype chain for instanceof checks after transpilation.
    Object.setPrototypeOf(this, ApiRequestException.prototype);
  }
}

async function readJsonResponse(
  response: Response,
  uri: string,
  errorPrefix: string,
): Promise<string> {
  const responseBody = await response.text();
  if (response.status < 200 || response.status >= 300) {
    throw new ApiRequestException(
      `${errorPrefix} with status ${response.status}: ${responseBody}`,
      { statusCode: response.status, uri },
    );
  }
  return responseBody;
}

export async function postJson(
  uri: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<string> {
  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  return readJsonResponse(response, uri, 'Request failed');
}

export async function getJson(
  uri: string,
  headers?: Record<string, string>,
): Promise<string> {
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  });

  return readJsonResponse(response, uri, 'Request failed');
}
