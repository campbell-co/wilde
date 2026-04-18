// Uses exchangerate.host — free, no key. Cached server-side for 30min.

type RateCache = { at: number; usdPerGbp: number; gbpPerUsd: number };
let CACHE: RateCache | null = null;
const TTL = 1000 * 60 * 30;

export async function getGbpUsdRate(): Promise<{ usdPerGbp: number; gbpPerUsd: number; at: number }> {
  if (CACHE && Date.now() - CACHE.at < TTL) {
    return { usdPerGbp: CACHE.usdPerGbp, gbpPerUsd: CACHE.gbpPerUsd, at: CACHE.at };
  }
  try {
    // Primary: Frankfurter (ECB-backed, free, stable)
    const res = await fetch('https://api.frankfurter.app/latest?from=GBP&to=USD', { next: { revalidate: 1800 } });
    if (res.ok) {
      const json = await res.json();
      const rate = Number(json?.rates?.USD);
      if (rate > 0) {
        CACHE = { at: Date.now(), usdPerGbp: rate, gbpPerUsd: 1 / rate };
        return { usdPerGbp: rate, gbpPerUsd: 1 / rate, at: CACHE.at };
      }
    }
  } catch {
    // fall through
  }
  // Fallback fixed rate if network fails
  const fallback = 1.27;
  CACHE = { at: Date.now(), usdPerGbp: fallback, gbpPerUsd: 1 / fallback };
  return { usdPerGbp: fallback, gbpPerUsd: 1 / fallback, at: CACHE.at };
}
