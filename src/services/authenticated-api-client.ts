/**
 * Builds the authorized request headers for token-protected endpoints.
 *
 * Ported from the Flutter app's `lib/services/authenticated_api_client.dart`.
 */
export class AuthenticatedApiClient {
  constructor(private readonly token: string) {}

  get authorizedHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/json',
    };
  }
}
