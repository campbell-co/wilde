import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getHotels } from '@/lib/db';
import { addHotel, removeHotelAction } from './actions';
import StayForm from './StayForm';
import { mapsLink } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function StayEditPage() {
  const session = await requireSession();
  const hotels = await getHotels(session.family);

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>STAY · {session.family.toUpperCase()}</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <StayForm action={addHotel} />

        {hotels.length === 0 ? (
          <div className="fine-print">No hotel yet.</div>
        ) : hotels.map((h) => (
          <div className="card" key={h.id}>
            <div className="card-title" style={{ marginBottom: 6 }}>{h.name.toUpperCase()}</div>
            {h.address ? (
              <a href={mapsLink(h.address)} target="_blank" rel="noopener noreferrer" className="maplink">
                {h.address} ↗
              </a>
            ) : null}
            {h.phone ? <div className="card-meta">{h.phone}</div> : null}
            {h.confirmation ? (
              <div className="card-divider" style={{ marginBottom: 10 }}>
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{h.confirmation}</span>
                <CopyButton value={h.confirmation} label="hotel confirmation" />
              </div>
            ) : null}
            <form action={removeHotelAction.bind(null, h.id)}>
              <button className="btn-line" style={{ width: '100%' }}>DELETE</button>
            </form>
          </div>
        ))}
      </main>
    </div>
  );
}
