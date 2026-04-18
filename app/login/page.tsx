import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { login } from './actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getSession();
  if (session) redirect('/');
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="login-shell">
      <div className="login-sub">CAMPBELL × NEWBY</div>

      <div className="login-center">
        <div className="login-title">
          <h1>WILDE</h1>
          <h1>ENGLAND</h1>
        </div>

        <form action={login}>
          {error ? <div className="login-error">WRONG PASSPHRASE</div> : null}

          <div className="form-group">
            <label className="form-label">PASSPHRASE</label>
            <input
              name="passphrase"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="form-input mono"
              style={{ letterSpacing: 2, padding: '14px 12px' }}
            />
          </div>

          <button type="submit" className="btn-solid" style={{ padding: 16 }}>
            ENTER →
          </button>
        </form>

        <div className="login-sub" style={{ marginTop: 20, marginBottom: 0 }}>
          INVITE ONLY
        </div>
      </div>

      <div className="login-footer">
        <span>EST. 2026</span>
        <span>WILDE ENGLAND</span>
      </div>
    </div>
  );
}
