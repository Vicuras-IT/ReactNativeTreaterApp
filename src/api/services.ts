import { Endpoints } from './config';
import { getJson, withQuery } from './client';
import {
  asArray,
  asObject,
  normaliseBase64,
  readBool,
  readDate,
  readInt,
  readName,
  readNumber,
  readString,
} from './_util';
import type {
  AssociatedTreater,
  DashboardData,
  ProfileData,
  RoomDetailsData,
  RoomDetailsTab,
  RoomImageData,
  ShiftData,
  ShiftEntry,
  ShiftPeriod,
  ShiftScheduleData,
  SpecificDayBooking,
} from './types';

/* ----------------------------- Dashboard ----------------------------- */

function parseShiftData(value: unknown): ShiftData | null {
  const json = asObject(value);
  if (!json) return null;
  return {
    start: readDate(json.start),
    end: readDate(json.end),
    account: readName(json, 'account', 'Ukendt kunde'),
    location: readName(json, 'location', 'Ukendt lokation'),
    room: readName(json, 'room', 'Ukendt rum'),
    workType: readName(json, 'workType', 'Ukendt behandling'),
  };
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const json = (await getJson<Record<string, unknown>>(
    Endpoints.dashboard,
    token,
  )) ?? {};
  const performance = asObject(json.performance);
  const important = asObject(json.importantMessages);
  return {
    nextShift: parseShiftData(json.nextShift),
    rating: readNumber(performance?.endUserRating, 0),
    sickAbsence: readNumber(performance?.sickAbsencePercentage, 0),
    todaysAppointments: asArray(json.todaysAppointments).length,
    activeTenderCustomerCount: readInt(important?.activeTenderCustomerCount, 0),
  };
}

/* ------------------------------ Profile ------------------------------ */

function joinAddress(contact: Record<string, unknown>): string {
  const cityLine = [
    readString(contact.postalCode),
    readString(contact.city),
  ]
    .filter(Boolean)
    .join(' ');
  return [
    readString(contact.addressLine1),
    readString(contact.addressLine2),
    readString(contact.addressLine3),
    cityLine,
    readString(contact.country),
  ]
    .filter((s) => s.trim().length > 0)
    .join('\n');
}

function namesFrom(value: unknown): string[] {
  return asArray(value)
    .map((item) => readName(asObject(item) ? (item as Record<string, unknown>) : null, 'name'))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function summariseNotifications(value: unknown): string {
  const settings = asObject(value);
  if (!settings) return '';
  const lines: string[] = [];
  for (const [key, raw] of Object.entries(settings)) {
    const entry = asObject(raw);
    const channels = asArray(entry?.channels)
      .map((c) => readName(asObject(c) ? (c as Record<string, unknown>) : null, 'name'))
      .filter(Boolean);
    if (channels.length > 0) lines.push(`${key}: ${channels.join(', ')}`);
  }
  return lines.join('\n');
}

function initialsFrom(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VC';
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return letters.join('') || 'VC';
}

export async function fetchProfile(token: string): Promise<ProfileData> {
  const json = (await getJson<Record<string, unknown>>(
    Endpoints.profile,
    token,
  )) ?? {};
  const contact = asObject(json.contactInfo) ?? {};
  const competencies = asObject(json.competencies);
  const availability = asObject(json.availability);

  const fullName = [
    readString(contact.firstName),
    readString(contact.lastName),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    fullName,
    primaryEmail:
      readString(contact.primaryEmail) || readString(contact.email) || '',
    mobilePhone: readString(contact.mobilePhone, 'Intet telefonnummer'),
    address: joinAddress(contact),
    skills: namesFrom(competencies?.skills),
    treatmentTypes: namesFrom(competencies?.treatmentTypes),
    temporarilyAvailable: readBool(availability?.temporarilyAvailable, false),
    eveningShifts: readName(
      availability,
      'opportunityForEveningShifts',
      'Ikke angivet',
    ),
    notificationSummary: summariseNotifications(json.notificationSettings),
    pictureBase64: normaliseBase64(json.vic_pictureoftreater) || null,
    initials: initialsFrom(fullName),
  };
}

/* ----------------------------- Shifts -------------------------------- */

function parseShiftEntry(value: unknown): ShiftEntry {
  const json = asObject(value) ?? {};
  const account = asObject(json.account);
  const room = asObject(json.room);
  return {
    id: readString(json.allocationScheduleId),
    name: typeof json.name === 'string' ? (json.name as string) : null,
    start: readDate(json.start),
    end: readDate(json.end),
    account: readName(json, 'account', 'Ukendt kunde'),
    companyId: readString(account?.id),
    location: readName(json, 'location', 'Ukendt lokation'),
    room: readName(json, 'room', 'Ukendt rum'),
    roomId: readString(room?.id),
    workType: readName(json, 'workType', 'Ukendt behandling'),
  };
}

function parseShiftPeriod(value: unknown): ShiftPeriod {
  const json = asObject(value) ?? {};
  return {
    year: json.year != null ? readInt(json.year) : null,
    month: json.month != null ? readInt(json.month) : null,
    weekNumber: json.weekNumber != null ? readInt(json.weekNumber) : null,
    startDate: readDate(json.startDate),
    endDate: readDate(json.endDate),
    shifts: asArray(json.shifts).map(parseShiftEntry),
  };
}

export async function fetchShifts(
  token: string,
  options: { month?: number; weekNumber?: number } = {},
): Promise<ShiftScheduleData> {
  const url = withQuery(Endpoints.shifts, {
    month: options.month,
    weekNumber: options.weekNumber,
  });
  const json = (await getJson<Record<string, unknown>>(url, token)) ?? {};
  return {
    month: parseShiftPeriod(json.month),
    week: parseShiftPeriod(json.week),
  };
}

/* ------------------------- Specific-day bookings --------------------- */

function parseBooking(value: unknown): SpecificDayBooking {
  const json = asObject(value) ?? {};
  const contact = asObject(json.amp_contact);
  const bookingStatus = readName(json, 'amp_geckostatus', 'Afventer');
  const status = readName(json, 'status', 'Ukendt');
  const isCompleted = bookingStatus.toLowerCase().includes('gennemført');
  const statusLower = status.toLowerCase();
  const isActive =
    !isCompleted &&
    (statusLower.includes('igangværende') ||
      statusLower.includes('i gang') ||
      statusLower.includes('aktiv'));
  return {
    bookingId: readString(json.bookingId),
    treaterName: readName(json, 'treater', 'Ukendt behandler'),
    start: readDate(json.start),
    end: readDate(json.end),
    serviceType: readName(json, 'amp_servicetype', 'Ukendt behandling'),
    contactName: readName(json, 'amp_contact', 'Ukendt klient'),
    contactFirstName: readString(contact?.firstName),
    contactLastName: readString(contact?.lastName),
    bookingStatus,
    state: readName(json, 'state', 'Ukendt'),
    status,
    isCompleted,
    isActive,
    displayStatus: isCompleted
      ? 'Gennemført'
      : isActive
        ? 'Igangværende'
        : bookingStatus,
  };
}

export async function fetchSpecificDayBookings(
  token: string,
  date: Date,
): Promise<SpecificDayBooking[]> {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const url = withQuery(Endpoints.specificDayBookings, { date: iso });
  const json = await getJson<unknown>(url, token);
  return asArray(json)
    .map(parseBooking)
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
}

/* ----------------------------- Room details -------------------------- */

interface RoomSectionDef {
  key: string;
  title: string;
}
interface RoomTabDef {
  title: string;
  sections: RoomSectionDef[];
}

const DANISH_TABS: RoomTabDef[] = [
  {
    title: 'Adgang',
    sections: [
      { key: 'amp_parkingnote', title: 'Parkering' },
      { key: 'amp_arrivalnote', title: 'Ankomstinformation' },
      { key: 'amp_treatmentroomlocation', title: 'Adgang til behandlingsrum' },
      { key: 'amp_endingworkday', title: 'Afslutning af arbejdsdag' },
    ],
  },
  {
    title: 'Faciliteter',
    sections: [
      { key: 'vic_wifitreatmentroom', title: 'Wi-Fi' },
      { key: 'amp_bathroomfacility', title: 'Toiletfaciliteter' },
      { key: 'amp_lunchnote', title: 'Frokost' },
      { key: 'amp_coffeemachine', title: 'Kaffe og te' },
    ],
  },
  {
    title: 'Lagener / Linned',
    sections: [
      { key: 'amp_sheetsdelivery', title: 'Antal lagener' },
      { key: 'amp_deliveryday', title: 'Leveringsdag' },
      { key: 'amp_deliveryinterval', title: 'Leveringsinterval' },
      { key: 'amp_deliverylocation', title: 'Leveringssted' },
      { key: 'amp_pickuplocation', title: 'Afhentningssted' },
    ],
  },
];

const ENGLISH_TABS: RoomTabDef[] = [
  {
    title: 'Access',
    sections: [
      { key: 'vic_parkingnoteuk', title: 'Parking' },
      { key: 'vic_arrivalnoteuk', title: 'Arrival information' },
      { key: 'vic_treatmentroomlocationuk', title: 'Treatment room access' },
      { key: 'vic_endofworkdayuk', title: 'End of workday' },
    ],
  },
  {
    title: 'Facilities',
    sections: [
      { key: 'vic_wifitreatmentroomuk', title: 'Wi-Fi' },
      { key: 'vic_bathroomfacilityuk', title: 'Bathroom' },
      { key: 'vic_lunchnoteuk', title: 'Lunch' },
      { key: 'vic_coffeemachineuk', title: 'Coffee & tea' },
    ],
  },
  {
    title: 'Linen',
    sections: [
      { key: 'amp_sheetsdelivery', title: 'Number of sheets' },
      { key: 'amp_deliveryday', title: 'Delivery day' },
      { key: 'amp_deliveryinterval', title: 'Delivery interval' },
      { key: 'vic_deliverylocationuk', title: 'Delivery location' },
      { key: 'vic_pickuplocationuk', title: 'Pickup location' },
    ],
  },
];

function parseRoomDetails(
  json: Record<string, unknown>,
  language: string,
): RoomDetailsData {
  const defs = language === 'en' ? ENGLISH_TABS : DANISH_TABS;
  const tabs: RoomDetailsTab[] = defs
    .map((def) => ({
      title: def.title,
      sections: def.sections
        .map((s) => ({ title: s.title, content: readString(json[s.key]) }))
        .filter((s) => s.content.trim().length > 0),
    }))
    .filter((tab) => tab.sections.length > 0);

  const associatedTreaters: AssociatedTreater[] = asArray(
    json.associated_treaters,
  )
    .map((item) => {
      const t = asObject(item) ?? {};
      return {
        name: readString(t.name),
        daysEven: readString(t.days_even),
        daysOdd: readString(t.days_odd),
        pictureOfTreater: normaliseBase64(t.picture_of_treater),
      };
    })
    .filter((t) => t.name.trim().length > 0);

  return { tabs, associatedTreaters, address: readString(json.amp_address) };
}

export async function fetchRoomDetails(
  token: string,
  roomId: string,
  language = 'da',
): Promise<RoomDetailsData> {
  const url = withQuery(Endpoints.room, { roomId, language });
  const json = (await getJson<Record<string, unknown>>(url, token)) ?? {};
  return parseRoomDetails(json, language);
}

/* ----------------------------- Room images --------------------------- */

export async function fetchRoomImages(
  token: string,
  companyId: string,
  roomId: string,
): Promise<RoomImageData[]> {
  const url = withQuery(Endpoints.locationImages, { companyId, roomId });
  const json = await getJson<unknown>(url, token);
  return asArray(json)
    .map((item) => {
      const obj = asObject(item) ?? {};
      const mimeType = readString(obj.mimeType, 'image/jpeg');
      const base64 = normaliseBase64(obj.content);
      return {
        name: readString(obj.name),
        mimeType,
        uri: base64 ? `data:${mimeType};base64,${base64}` : '',
      };
    })
    .filter((img) => img.uri.length > 0);
}
