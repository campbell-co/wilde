import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getItineraryDays, getItineraryItems } from '@/lib/db';
import { addDay } from './actions';
import { fmtDateParts } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ItineraryListPage() {
  await requireSession();
  const [days, items] = await Promise.all([getItineraryDays(), getItineraryItems()]);
  const itemsByDay = new Map<number, typeof items>();
  for (const d of days) itemsByDay.set(d.id, []);
  for (const i of items) itemsByDay.get(i.day_id)?.push(i);

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>ITINERARY</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <form action={addDay} className="card" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">ADD A DAY</label>
            <input type="date" name="date" required className="form-input" />
          </div>
          <button type="submit" className="btn-solid">+ ADD DAY</button>
        </form>

        {days.length === 0 ? (
          <div className="fine-print">No days yet. Add your first one above.</div>
        ) : days.map((d, idx) => {
          const p = fmtDateParts(d.date);
          const dayItems = itemsByDay.get(d.id) || [];
          return (
            <Link href={`/itinerary/${d.id}`} className="itin-row" key={d.id}>
              <div className="itin-date">
                <div className="dow">{p.dow}</div>
                <div className="num">{p.day}</div>
                <div className="mon">{p.mon}</div>
              </div>
              <div className="itin-body">
                <div className="itin-body-head">
                  <div className="itin-daynum">DAY {(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="itin-weather">{dayItems.length} item{dayItems.length === 1 ? '' : 's'}</div>
                </div>
                <div className="itin-desc">
                  {d.title || dayItems.map((i) => i.name).slice(0, 3).join(' · ') || 'Tap to add items'}
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
