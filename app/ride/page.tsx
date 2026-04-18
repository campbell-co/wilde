import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { getTrains } from '@/lib/db';
import { addTrain, removeTrainAction } from './actions';
import { fmtDate, fmtTime } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function RideEditPage() {
  await requireSession();
  const trains = await getTrains();

  return (
    <div className="shell">
      <div className="editor-bar">
        <Link href="/">← BACK</Link>
        <span>RIDE</span>
        <span style={{ width: 40 }} />
      </div>

      <main className="main">
        <form action={addTrain} className="card" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">FROM</label>
              <input name="origin" required className="form-input" placeholder="London" />
            </div>
            <div className="form-group">
              <label className="form-label">TO</label>
              <input name="destination" required className="form-input" placeholder="Edinburgh" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">OPERATOR</label>
            <input name="operator" className="form-input" placeholder="LNER" />
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
            <input name="confirmation" className="form-input mono" placeholder="LNER-9X2K" />
          </div>
          <div className="form-group">
            <label className="form-label">NOTES</label>
            <textarea name="notes" className="form-textarea" rows={2} placeholder="King's Cross · coach B seat 42" />
          </div>
          <button type="submit" className="btn-solid">+ ADD TRAIN</button>
        </form>

        {trains.length === 0 ? (
          <div className="fine-print">No trains scheduled.</div>
        ) : trains.map((t) => (
          <div className="card" key={t.id}>
            <div className="card-title" style={{ marginBottom: 6 }}>{t.origin.toUpperCase()} → {t.destination.toUpperCase()}</div>
            <div className="card-meta">
              {t.operator} · {fmtDate(t.depart_at)} · {fmtTime(t.depart_at, 'Europe/London')} → {fmtTime(t.arrive_at, 'Europe/London')}
            </div>
            {t.notes ? <div className="fine-print" style={{ marginBottom: 10 }}>{t.notes}</div> : null}
            {t.confirmation ? (
              <div className="card-divider" style={{ marginBottom: 10 }}>
                <span className="label-muted">CONF</span>
                <span className="mono" style={{ fontWeight: 500, flex: 1 }}>{t.confirmation}</span>
                <CopyButton value={t.confirmation} label="train confirmation" />
              </div>
            ) : null}
            <form action={removeTrainAction.bind(null, t.id)}>
              <button className="btn-line" style={{ width: '100%' }}>DELETE</button>
            </form>
          </div>
        ))}
      </main>
    </div>
  );
}
