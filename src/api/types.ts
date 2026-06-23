/**
 * TypeScript models — ported from the Flutter app's lib/models/*.dart.
 * Field-level defaults & Danish fallbacks are applied in the parsers
 * (see services.ts) to match the original `fromJson` behaviour exactly.
 */

export interface AuthSession {
  token: string;
  /** 'da' | 'en' — normalised from the login response. */
  language: string;
}

export interface ShiftData {
  start: Date | null;
  end: Date | null;
  account: string;
  location: string;
  room: string;
  workType: string;
}

export interface DashboardData {
  nextShift: ShiftData | null;
  rating: number;
  sickAbsence: number;
  todaysAppointments: number;
  activeTenderCustomerCount: number;
}

export interface ProfileData {
  fullName: string;
  primaryEmail: string;
  mobilePhone: string;
  address: string;
  skills: string[];
  treatmentTypes: string[];
  temporarilyAvailable: boolean;
  eveningShifts: string;
  notificationSummary: string;
  /** Raw base64 of the treater photo (no data: prefix), if present. */
  pictureBase64: string | null;
  initials: string;
}

export interface ShiftEntry {
  id: string;
  name: string | null;
  start: Date | null;
  end: Date | null;
  account: string;
  companyId: string;
  location: string;
  room: string;
  roomId: string;
  workType: string;
}

export interface ShiftPeriod {
  year: number | null;
  month: number | null;
  weekNumber: number | null;
  startDate: Date | null;
  endDate: Date | null;
  shifts: ShiftEntry[];
}

export interface ShiftScheduleData {
  month: ShiftPeriod;
  week: ShiftPeriod;
}

export interface SpecificDayBooking {
  bookingId: string;
  treaterName: string;
  start: Date | null;
  end: Date | null;
  serviceType: string;
  contactName: string;
  contactFirstName: string;
  contactLastName: string;
  bookingStatus: string;
  state: string;
  status: string;
  isCompleted: boolean;
  isActive: boolean;
  displayStatus: string;
}

export interface RoomDetailsSection {
  title: string;
  content: string;
}

export interface RoomDetailsTab {
  title: string;
  sections: RoomDetailsSection[];
}

export interface AssociatedTreater {
  name: string;
  daysEven: string;
  daysOdd: string;
  pictureOfTreater: string;
}

export interface RoomDetailsData {
  tabs: RoomDetailsTab[];
  associatedTreaters: AssociatedTreater[];
  address: string;
}

export interface RoomImageData {
  name: string;
  mimeType: string;
  /** data: URI ready for <Image source={{ uri }} />, or '' if undecodable. */
  uri: string;
}
