'use client';

import { useEffect, useState } from 'react';
import { parseLocalDate } from '@/lib/utils';

type Day = { id: number; date: string; title: string | null };
type Item = { id: number; day_id: number; time: string | null; name: string };
type Forecast = { date: string; low: number; high: number; condition: string };

// Parse a free-form time like "8:00 PM" or "14:30" into minutes since midnight.
function parseTimeToMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const s = t.trim().toUpperCase();
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[3];
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

export default function NowStrip({
  days,
  items,
  forecasts,
}: {
  days: Day[];
  items: Item[];
  forecasts: Forecast[];
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const t = new Date();
    setNow(t);
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!now || days.length === 0) return null;

  // Compute London-local date parts via Intl (locale-independent)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '00';
  const todayKey = `${get('year')}-${get('month')}-${get('day')}`;
  const londonHours = parseInt(get('hour'), 10);
  const londonMinutes = parseInt(get('minute'), 10);

  // Only show during the trip
  const first = days[0].date;
  const last = days[days.length - 1].date;
  if (todayKey < first || todayKey > last) return null;

  // Find today's day index
  const todayIdx = days.findIndex((d) => d.date === todayKey);
  if (todayIdx === -1) return null;
  const todayDay = days[todayIdx];

  const wx = forecasts.find((f) => f.date === todayKey);
  const todayItems = items
    .filter((i) => i.day_id === todayDay.id)
    .map((i) => ({ ...i, mins: parseTimeToMinutes(i.time) }))
    .sort((a, b) => a.mins - b.mins);

  const nowMins = londonHours * 60 + londonMinutes;
  const upcoming = todayItems.find((i) => i.mins >= nowMins);

  const dayLabel = `DAY ${(todayIdx + 1).toString().padStart(2, '0')}`;

  let title = '';
  if (upcoming) {
    const delta = upcoming.mins - nowMins;
    if (delta <= 0) title = `${upcoming.name} · now`;
    else if (delta < 60) title = `${upcoming.name} in ${delta}m`;
    else {
      const h = Math.floor(delta / 60);
      const m = delta % 60;
      title = `${upcoming.name} in ${h}h${m > 0 ? ` ${m}m` : ''}`;
    }
  } else {
    title = todayDay.title || 'Enjoy your day';
  }

  const dateNice = parseLocalDate(todayKey).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  }).toUpperCase();
  const wxLabel = wx ? ` · ${wx.low}°–${wx.high}° ${wx.condition}` : '';

  return (
    <div className="now-strip">
      <div className="now-strip-label">NOW · {dayLabel}</div>
      <div className="now-strip-title">{title}</div>
      <div className="now-strip-meta">{dateNice}{wxLabel}</div>
    </div>
  );
}
