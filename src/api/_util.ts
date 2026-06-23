/** Small, defensive readers for loosely-typed API JSON. */

type Json = Record<string, unknown>;

export function asObject(value: unknown): Json | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Json)
    : null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function readString(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

/** Reads `obj[key].name` (a common Dynamics lookup shape). */
export function readName(obj: Json | null, key: string, fallback = ''): string {
  const nested = asObject(obj?.[key]);
  return readString(nested?.name, fallback);
}

export function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function readInt(value: unknown, fallback = 0): number {
  return Math.trunc(readNumber(value, fallback));
}

export function readBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

/** Parses an ISO datetime to a local Date, or null. */
export function readDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Strips an optional `data:...;base64,` prefix and whitespace. */
export function normaliseBase64(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) return '';
  const raw = value.includes(',') ? value.split(',').pop() ?? '' : value;
  return raw.replace(/\s+/g, '');
}
