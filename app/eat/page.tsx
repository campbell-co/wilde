import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getDinners } from '@/lib/db';
import { addDinner, removeDinnerAction } from './actions';
import EatForm from './EatForm';
import { mapsLink, fmtDate, fmtTime } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function EatEditPage() {
  await requireSession();
  const dinners = await getDinners();

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>EAT</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <EatForm action={addDinner} />

        {dinners.length === 0 ? (
          <div className="fine-print">No reservations yet.</div>
        ) : dinners.map((d) => (
          <div className="card" key={d.id}>
            <div className="card-title" style={{ marginBottom: 4 }}>{d.name.toUpperCase()}</div>
            <div className="card-meta" style={{ marginBottom: 6 }}>
              {fmtDate(d.reservation_at)} · {fmtTime(d.reservation_at, 'Europe/London')}
              {d.party_size ? ` · party of ${d.party_size}` : ''}
            </div>
            {d.address ? (
              <a href={mapsLink(d.address)} target="_blank" rel="noopener noreferrer" className="maplink">
                {d.address} ↗
              </a>
            ) : null}
            {d.confirmation ? (
              <div className="card-divider" style={{ marginBottom: 10 }}>
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{d.confirmation}</span>
                <CopyButton value={d.confirmation} label="dinner confirmation" />
              </div>
            ) : null}
            <form action={removeDinnerAction.bind(null, d.id)}>
              <button className="btn-line" style={{ width: '100%' }}>DELETE</button>
            </form>
          </div>
        ))}
      </main>
    </div>
  );
}
