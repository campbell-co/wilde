import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getCars } from '@/lib/db';
import { addCar, removeCarAction } from './actions';
import DriveForm from './DriveForm';
import { mapsLink, fmtDate, fmtTime } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function DriveEditPage() {
  const session = await requireSession();
  const cars = await getCars(session.family);

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>DRIVE · {session.family.toUpperCase()}</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <DriveForm action={addCar} />

        {cars.length === 0 ? (
          <div className="fine-print">No rental car yet.</div>
        ) : cars.map((c) => (
          <div className="card" key={c.id}>
            <div className="card-title" style={{ marginBottom: 6 }}>{c.company.toUpperCase()}</div>
            {c.pickup_at ? (
              <div className="card-meta">
                Pickup {fmtDate(c.pickup_at)} · {fmtTime(c.pickup_at)}
                {c.return_at ? ` → ${fmtDate(c.return_at)} · ${fmtTime(c.return_at)}` : ''}
              </div>
            ) : null}
            {c.pickup_address ? (
              <a href={mapsLink(c.pickup_address)} target="_blank" rel="noopener noreferrer" className="maplink">
                {c.pickup_location ? `${c.pickup_location} · ` : ''}{c.pickup_address} ↗
              </a>
            ) : null}
            {c.confirmation ? (
              <div className="card-divider" style={{ marginBottom: 10 }}>
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{c.confirmation}</span>
                <CopyButton value={c.confirmation} label="car confirmation" />
              </div>
            ) : null}
            <form action={removeCarAction.bind(null, c.id)}>
              <button className="btn-line" style={{ width: '100%' }}>DELETE</button>
            </form>
          </div>
        ))}
      </main>
    </div>
  );
}
