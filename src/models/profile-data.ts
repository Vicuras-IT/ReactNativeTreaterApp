/**
 * Treater profile model.
 *
 * Ported from the Flutter app's `lib/models/profile_data.dart`. The profile
 * picture is kept as the raw base64 string (rather than decoded bytes), since
 * React Native's <Image> accepts a `data:` URI directly.
 */

type Json = Record<string, unknown>;

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asMap(value: unknown): Json {
  return value !== null && typeof value === 'object' ? (value as Json) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function namesFrom(list: unknown): string[] {
  return asArray(list)
    .map((item) => asString(asMap(item).name) ?? '')
    .filter((name) => name.length > 0);
}

export interface ProfileData {
  readonly fullName: string;
  readonly primaryEmail: string;
  readonly mobilePhone: string;
  readonly address: string;
  readonly skills: string[];
  readonly treatmentTypes: string[];
  readonly temporarilyAvailable: boolean;
  readonly eveningShifts: string;
  readonly notificationSummary: string;
  readonly pictureBase64: string | null;
}

export function profileInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) return 'VC';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function profileDataFromJson(json: Json): ProfileData {
  const contact = asMap(json.contactInfo);
  const competencies = asMap(json.competencies);
  const availability = asMap(json.availability);
  const notificationSettings = asMap(json.notificationSettings);
  const picture = asString(json.vic_pictureoftreater) ?? null;

  const postalLine = `${asString(contact.postalCode) ?? ''} ${asString(contact.city) ?? ''}`.trim();
  const address = [
    asString(contact.addressLine1),
    asString(contact.addressLine2),
    asString(contact.addressLine3),
    postalLine,
    asString(contact.country),
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join('\n');

  const eveningShifts =
    asString(asMap(availability.opportunityForEveningShifts).name) ?? 'Ikke angivet';

  const notificationSummary = Object.entries(notificationSettings)
    .map(([key, value]) => {
      const channels = asArray(asMap(value).channels)
        .map((channel) => asString(asMap(channel).name))
        .filter((name): name is string => typeof name === 'string')
        .join(', ');
      return `${key}: ${channels.length === 0 ? 'Ingen kanaler' : channels}`;
    })
    .join('\n');

  return {
    fullName: `${asString(contact.firstName) ?? ''} ${asString(contact.lastName) ?? ''}`.trim(),
    primaryEmail: asString(contact.primaryEmail) ?? asString(contact.email) ?? '',
    mobilePhone: asString(contact.mobilePhone) ?? 'Intet telefonnummer',
    address,
    skills: namesFrom(competencies.skills),
    treatmentTypes: namesFrom(competencies.treatmentTypes),
    temporarilyAvailable: availability.temporarilyAvailable === true,
    eveningShifts,
    notificationSummary,
    pictureBase64: picture,
  };
}
