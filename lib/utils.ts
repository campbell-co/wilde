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

// Parse a YYYY-MM-DD string as a LOCAL date (no timezone drift)
export function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function fmtDateParts(isoDate: string) {
  const d = parseLocalDate(isoDate);
  return {
    dow: DOW[d.getDay()],
    day: d.getDate().toString().padStart(2, '0'),
    mon: MON[d.getMonth()],
  };
}

export function fmtDateShort(isoDate: string): string {
  const { dow, day, mon } = fmtDateParts(isoDate);
  return `${dow} ${mon} ${day}`;
}

export function fmtTimestampParts(ts: string, tz: string = 'America/Chicago') {
  const d = new Date(ts);
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

export function fmtTime(ts: string, tz: string = 'America/Chicago') {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function fmtDate(ts: string, tz: string = 'America/Chicago') {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d).toLowerCase();
}

export function countdownTo(target: string) {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, past: true };
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, past: false };
}

export function pad2(n: number) {
  return n.toString().padStart(2, '0');
}
