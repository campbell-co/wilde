export function mapsLink(address: string | null | undefined): string {
  if (!address) return '#';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function telLink(phone: string | null | undefined): string {
  if (!phone) return '#';
  // strip anything that isn't a digit or leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Parse a date — accepts a YYYY-MM-DD string or a Date object
// (Neon returns DATE columns as Date objects, not strings).
// In all cases, returns a Date representing midnight local time.
export function parseLocalDate(input: string | Date): Date {
  if (input instanceof Date) {
    // Use UTC parts so a 00:00:00Z timestamp doesn't drift a day
    // west of UTC-offset clients
    return new Date(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate());
  }
  const [y, m, d] = input.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Convert whatever the DB hands back into a canonical YYYY-MM-DD string
export function toIsoDate(input: string | Date): string {
  if (input instanceof Date) {
    const y = input.getUTCFullYear();
    const m = String(input.getUTCMonth() + 1).padStart(2, '0');
    const d = String(input.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // String like '2026-04-29' or '2026-04-29T00:00:00.000Z' — take first 10 chars
  return input.slice(0, 10);
}

export function fmtDateParts(isoDate: string | Date) {
  const d = parseLocalDate(isoDate);
  return {
    dow: DOW[d.getDay()],
    day: d.getDate().toString().padStart(2, '0'),
    mon: MON[d.getMonth()],
  };
}

export function fmtDateShort(isoDate: string | Date): string {
  const { dow, day, mon } = fmtDateParts(isoDate);
  return `${dow} ${mon} ${day}`;
}

export function fmtTimestampParts(ts: string | Date, tz: string = 'America/Chicago') {
  const d = ts instanceof Date ? ts : new Date(ts);
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat('en-US', opts).format(d).toLowerCase();
}

export function fmtTime(ts: string | Date, tz: string = 'America/Chicago') {
  const d = ts instanceof Date ? ts : new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function fmtDate(ts: string | Date, tz: string = 'America/Chicago') {
  const d = ts instanceof Date ? ts : new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d).toLowerCase();
}

export function countdownTo(target: string | Date) {
  const targetTime = target instanceof Date ? target.getTime() : new Date(target).getTime();
  const ms = targetTime - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, past: true };
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, past: false };
}

export function pad2(n: number) {
  return n.toString().padStart(2, '0');
}
