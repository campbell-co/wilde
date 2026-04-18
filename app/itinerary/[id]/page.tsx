import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { getItineraryItems } from '@/lib/db';
import { fmtDateParts } from '@/lib/utils';
import DayEditor from './DayEditor';
import { saveDay, removeDay } from '../actions';

export const dynamic = 'force-dynamic';

export default async function DayEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const dayId = Number(id);
  if (!dayId) notFound();

  const { rows } = await sql<{ id: number; date: string; title: string | null; notes: string | null }>`
    SELECT * FROM itinerary_days WHERE id = ${dayId}
  `;
  const day = rows[0];
  if (!day) notFound();

  const allItems = await getItineraryItems();
  const items = allItems.filter((i) => i.day_id === dayId);

  const parts = fmtDateParts(day.date);

  const saveAction = saveDay.bind(null, dayId);
  const deleteAction = removeDay.bind(null, dayId);

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/itinerary">← BACK</Link>
        <span>EDIT DAY</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #000' }}>
          <div style={{ border: '1px solid #000', padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '1.5px', color: '#5F5E5A' }}>{parts.dow}</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -1, lineHeight: 1 }}>{parts.day}</div>
            <div style={{ fontSize: 9, letterSpacing: 1, color: '#5F5E5A', marginTop: 2 }}>{parts.mon}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, fontWeight: 500, marginBottom: 2 }}>DAY</div>
            <div style={{ fontSize: 10, letterSpacing: 1, color: '#5F5E5A' }}>{day.date}</div>
          </div>
        </div>

        <DayEditor
          date={day.date}
          title={day.title}
          notes={day.notes}
          items={items}
          saveAction={saveAction}
          deleteAction={deleteAction}
        />
      </main>
    </div>
  );
}
