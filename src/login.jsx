// Login — invite-code + Google sign-in (mocked).
// Real implementation: Firebase Auth (Google provider) + Firestore allow-list of invite codes.

const Login = ({ onSignIn }) => {
  const [mode, setMode] = React.useState('signin'); // 'signin' | 'invite'
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [err, setErr] = React.useState('');

  const VALID_CODE = 'ELLIE-2026'; // placeholder; in real app this lives in Firestore

  const handleGoogle = () => {
    setPending(true);
    setErr('');
    // Simulate auth round-trip
    setTimeout(() => {
      onSignIn({ name: 'Justin', email: 'justin@elliebets.app', provider: 'google' });
    }, 700);
  };

  const handleCode = (e) => {
    e.preventDefault();
    setErr('');
    if (code.trim().toUpperCase() !== VALID_CODE) {
      setErr('Invalid invite code. Codes are issued by the owner only.');
      return;
    }
    setPending(true);
    setTimeout(() => {
      onSignIn({ name: email.split('@')[0] || 'Guest', email, provider: 'code' });
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24,
      background: 'var(--eb-bg-app)',
    }}>
      {/* Background flourish */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(600px 400px at 20% 30%, rgba(34,197,94,0.10), transparent 60%), radial-gradient(700px 500px at 85% 85%, rgba(74,222,128,0.06), transparent 60%)',
      }} />

      <div className="eb-panel eb-fade-up" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        padding: 36,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <Logo size={64} />
          <div style={{
            fontFamily: 'var(--eb-font-display)', fontWeight: 900,
            fontSize: 30, letterSpacing: '-0.015em', lineHeight: 1,
          }}>
            <span style={{ color: 'var(--eb-fg-1)' }}>ellie</span>
            <span style={{ color: 'var(--eb-green)' }}>bets</span>
          </div>
          <div style={{ color: 'var(--eb-fg-2)', fontSize: 13, letterSpacing: '0.04em' }}>
            Private. Invite only.
          </div>
        </div>

        {mode === 'signin' ? (
          <>
            <button
              className="eb-btn eb-btn-ghost"
              onClick={handleGoogle}
              disabled={pending}
              style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 700 }}
            >
              <GoogleG />
              {pending ? 'Signing in…' : 'Continue with Google'}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '20px 0', color: 'var(--eb-fg-3)', fontSize: 11, letterSpacing: '0.16em',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--eb-divider)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--eb-divider)' }} />
            </div>

            <button
              className="eb-btn eb-btn-soft"
              onClick={() => setMode('invite')}
              style={{ width: '100%', padding: '12px' }}
            >
              Enter invite code
            </button>
          </>
        ) : (
          <form onSubmit={handleCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="eb-label">Invite code</label>
              <input
                className="eb-input eb-mono"
                placeholder="ELLIE-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="eb-label">Email</label>
              <input
                className="eb-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {err && (
              <div style={{
                color: 'var(--eb-loss)', fontSize: 12, fontWeight: 600,
                padding: '8px 12px', background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.22)', borderRadius: 8,
              }}>{err}</div>
            )}
            <button type="submit" className="eb-btn eb-btn-primary" disabled={pending}>
              {pending ? 'Verifying…' : 'Verify & Enter'}
            </button>
            <button type="button" className="eb-btn eb-btn-ghost" onClick={() => setMode('signin')}>
              ← Back
            </button>
            <div className="eb-hint" style={{ textAlign: 'center', marginTop: 4 }}>
              Hint for the demo: <span className="eb-mono" style={{ color: 'var(--eb-green)' }}>ELLIE-2026</span>
            </div>
          </form>
        )}

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'var(--eb-fg-4)' }}>
          Codes issued by owner only. Session auto-locks on browser close.
        </div>
      </div>
    </div>
  );
};

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.4 6.64v5.52h7.11c4.16-3.83 6.57-9.47 6.57-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18A13.6 13.6 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A22 22 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 12.12l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75z"/>
  </svg>
);

Object.assign(window, { Login });
