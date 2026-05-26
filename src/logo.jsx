// EllieBets logo — bold "E" mark formed from over/under bars
// Usage: <Logo size={40} /> for the mark, <Wordmark /> for full lockup

const Logo = ({ size = 40, glow = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="Ellie Bets logo"
    style={{ display: 'block', filter: glow ? 'drop-shadow(0 4px 14px rgba(74,222,128,0.35))' : 'none' }}
  >
    <defs>
      <linearGradient id="ebTile" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1c2a23" />
        <stop offset="100%" stopColor="#0e1613" />
      </linearGradient>
      <linearGradient id="ebBar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
    {/* Tile */}
    <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#ebTile)" />
    <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" fill="none" stroke="rgba(74,222,128,0.18)" />
    {/* "E" — three bars (top = over tick, mid = spine cap, bottom = under tick) with a left spine */}
    {/* Left spine */}
    <rect x="14" y="14" width="6" height="36" rx="3" fill="url(#ebBar)" />
    {/* Top bar (longest — "over") */}
    <rect x="14" y="14" width="36" height="6" rx="3" fill="url(#ebBar)" />
    {/* Middle bar (shorter) */}
    <rect x="14" y="29" width="24" height="6" rx="3" fill="url(#ebBar)" opacity="0.95" />
    {/* Bottom bar */}
    <rect x="14" y="44" width="36" height="6" rx="3" fill="url(#ebBar)" />
    {/* Edge dot — accent at top-right corner of E, signals "the edge" */}
    <circle cx="50" cy="17" r="3" fill="#86efac" />
    <circle cx="50" cy="17" r="6" fill="none" stroke="#86efac" strokeOpacity="0.35" />
  </svg>
);

const Wordmark = ({ size = 22 }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--eb-font-display)',
    fontWeight: 900,
    fontSize: size,
    letterSpacing: '-0.01em',
    lineHeight: 1,
    color: 'var(--eb-fg-1)'
  }}>
    <Logo size={size * 1.5} />
    <span>
      <span style={{ color: 'var(--eb-fg-1)' }}>ellie</span>
      <span style={{ color: 'var(--eb-green)' }}>bets</span>
    </span>
  </div>
);

Object.assign(window, { Logo, Wordmark });
