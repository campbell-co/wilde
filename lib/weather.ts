// Open-Meteo free API — no key required.
// Returns daily low/high + condition code mapped to a short label.

const CONDITION_MAP: Record<number, string> = {
  0: 'CLEAR',
  1: 'SUN',
  2: 'CLOUD',
  3: 'OVERCAST',
  45: 'FOG',
  48: 'FOG',
  51: 'DRIZZLE',
  53: 'DRIZZLE',
  55: 'DRIZZLE',
  61: 'RAIN',
  63: 'RAIN',
  65: 'HEAVY RAIN',
  66: 'FREEZING',
  67: 'FREEZING',
  71: 'SNOW',
  73: 'SNOW',
  75: 'HEAVY SNOW',
  77: 'SNOW',
  80: 'SHOWERS',
  81: 'SHOWERS',
  82: 'HEAVY RAIN',
  85: 'SNOW',
  86: 'SNOW',
  95: 'STORM',
  96: 'STORM',
  99: 'STORM',
};

export type DayForecast = {
  date: string; // YYYY-MM-DD
  low: number;
  high: number;
  condition: string;
};

type CacheEntry = { at: number; data: DayForecast[] };
const CACHE: Record<string, CacheEntry> = {};
const TTL = 1000 * 60 * 30; // 30 min

function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

export async function getForecast(lat: number, lon: number, startDate: string, endDate: string): Promise<DayForecast[]> {
  const key = `${lat},${lon},${startDate},${endDate}`;
  const hit = CACHE[key];
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const json = await res.json();
    const dates: string[] = json?.daily?.time ?? [];
    const maxs: number[] = json?.daily?.temperature_2m_max ?? [];
    const mins: number[] = json?.daily?.temperature_2m_min ?? [];
    const codes: number[] = json?.daily?.weather_code ?? [];
    const out: DayForecast[] = dates.map((d, i) => ({
      date: d,
      low: cToF(mins[i] ?? 0),
      high: cToF(maxs[i] ?? 0),
      condition: CONDITION_MAP[codes[i]] ?? 'CLOUD',
    }));
    CACHE[key] = { at: Date.now(), data: out };
    return out;
  } catch {
    return [];
  }
}

export async function getTodayForecast(lat: number, lon: number): Promise<DayForecast | null> {
  const today = new Date().toISOString().slice(0, 10);
  const out = await getForecast(lat, lon, today, today);
  return out[0] ?? null;
}

// Common points
export const LONDON = { lat: 51.5074, lon: -0.1278 };
export const KELLER = { lat: 32.9346, lon: -97.2517 };
