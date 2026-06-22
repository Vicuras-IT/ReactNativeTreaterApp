/**
 * Loads the authenticated treater's profile.
 *
 * Ported from the Flutter app's `lib/services/profile_data_service.dart`.
 */
import { getJson } from '@/services/api-transport';
import { AuthenticatedApiClient } from '@/services/authenticated-api-client';
import { profileDataFromJson, type ProfileData } from '@/models/profile-data';
import { profileUrl } from '@/lib/urls';

export class ProfileDataService {
  async load(token: string): Promise<ProfileData> {
    const client = new AuthenticatedApiClient(token);
    const raw = await getJson(profileUrl, client.authorizedHeaders);
    return profileDataFromJson(JSON.parse(raw) as Record<string, unknown>);
  }
}
