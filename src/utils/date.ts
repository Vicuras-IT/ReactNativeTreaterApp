/** Danish date/time formatting — ported from lib/utils/date_formatters.dart. */

const WEEKDAYS_DA = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
const MONTHS_DA = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** "14:30" */
export function formatTime(value: Date | null): string {
  if (!value) return '--:--';
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

/** "Man 15/10 14:30" */
export function formatDateTime(value: Date | null): string {
  if (!value) return '';
  return `${WEEKDAYS_DA[value.getDay()]} ${value.getDate()}/${value.getMonth() + 1} ${formatTime(value)}`;
}

/** "15. oktober" */
export function formatDateLong(value: Date | null): string {
  if (!value) return '';
  return `${value.getDate()}. ${MONTHS_DA[value.getMonth()]}`;
}

/** "08:00 – 15:00" */
export function formatTimeRange(start: Date | null, end: Date | null): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}
