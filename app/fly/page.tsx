import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getFlights } from '@/lib/db';
import { addFlight, removeFlightAction } from './actions';
import { fmtDate, fmtTime } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function FlyEditPage() {
  const session = await requireSession();
  const flights = await getFlights(session.family);

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>FLY · {session.family.toUpperCase()}</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <form action={addFlight} className="card" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">FROM</label>
              <input name="origin" required className="form-input" placeholder="DFW" />
            </div>
            <div className="form-group">
              <label className="form-label">TO</label>
              <input name="destination" required className="form-input" placeholder="LHR" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">AIRLINE</label>
              <input name="airline" className="form-input" placeholder="American" />
            </div>
            <div className="form-group">
              <label className="form-label">FLIGHT #</label>
              <input name="flight_number" className="form-input" placeholder="AA 6014" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">DEPART (local)</label>
              <input name="depart_at" type="datetime-local" required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">ARRIVE (local)</label>
              <input name="arrive_at" type="datetime-local" required className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">CONFIRMATION</label>
            <input name="confirmation" className="form-input mono" placeholder="JKLMN8" />
          </div>
          <button type="submit" className="btn-solid">+ ADD FLIGHT</button>
        </form>

        {flights.length === 0 ? (
          <div className="fine-print">No flights yet.</div>
        ) : flights.map((f) => (
          <div className="card" key={f.id}>
            <div className="card-row">
              <div className="card-title">{f.origin} → {f.destination}</div>
              {f.status ? <div className="status-pill">{f.status}</div> : null}
            </div>
            <div className="card-meta">
              {f.airline} {f.flight_number} · {fmtDate(f.depart_at)} · {fmtTime(f.depart_at)} → {fmtTime(f.arrive_at, 'Europe/London')}
            </div>
            {f.confirmation ? (
              <div className="card-divider" style={{ marginBottom: 10 }}>
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{f.confirmation}</span>
                <CopyButton value={f.confirmation} label="flight confirmation" />
              </div>
            ) : null}
            <form action={removeFlightAction.bind(null, f.id)}>
              <button className="btn-line" style={{ width: '100%' }}>DELETE</button>
            </form>
          </div>
        ))}
      </main>
    </div>
  );
}
