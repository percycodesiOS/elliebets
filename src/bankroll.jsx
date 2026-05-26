// Bankroll — running P/L, ROI, breakdowns by book + sport, and sparkline of profit over time.

const Bankroll = ({ bets, startingBank = 1000 }) => {
  const stats = React.useMemo(() => computeBankroll(bets, startingBank), [bets, startingBank]);

  return (
    <div className="eb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 13,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--eb-fg-1)',
      }}>Bankroll</div>

      {/* Hero number */}
      <div style={{
        padding: '18px 16px',
        background: 'var(--eb-bg-1)',
        border: `1px solid ${stats.netProfit >= 0 ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.30)'}`,
        borderRadius: 16,
        textAlign: 'center',
        boxShadow: stats.netProfit >= 0 ? '0 0 32px rgba(74,222,128,0.10)' : '0 0 32px rgba(248,113,113,0.08)',
      }}>
        <div className="eb-stat-label">Net Profit</div>
        <div className="eb-mono" style={{
          fontFamily: 'var(--eb-font-display)', fontWeight: 900,
          fontSize: 36, lineHeight: 1.05,
          color: stats.netProfit >= 0 ? 'var(--eb-win)' : 'var(--eb-loss)',
          letterSpacing: '-0.01em', marginTop: 2,
        }}>
          {fmtMoney(stats.netProfit, { showSign: true })}
        </div>
        <div className="eb-hint" style={{ marginTop: 4 }}>
          ROI <span className={stats.roi >= 0 ? 'eb-up' : 'eb-down'} style={{ fontWeight: 700, marginLeft: 4 }}>
            {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
          </span>
          <span style={{ margin: '0 8px', color: 'var(--eb-fg-4)' }}>·</span>
          Win rate <span style={{ fontWeight: 700, color: 'var(--eb-fg-1)' }}>{stats.winRatePct.toFixed(0)}%</span>
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline points={stats.curve} positive={stats.netProfit >= 0} />

      {/* Tally row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Tally label="Money Made" value={fmtMoney(stats.totalWon, { showSign: true })} tone="up" />
        <Tally label="Money Lost" value={fmtMoney(-stats.totalLost, { showSign: true })} tone="down" />
        <Tally label="Total Wagered" value={fmtMoney(stats.totalWagered)} />
        <Tally label="At Risk" value={fmtMoney(stats.atRisk)} tone="warn" />
      </div>

      {/* Records */}
      <div style={{
        padding: 12, background: 'var(--eb-bg-1)', border: '1px solid var(--eb-border)', borderRadius: 10,
        display: 'flex', justifyContent: 'space-around', textAlign: 'center', gap: 8,
      }}>
        <Record num={stats.wonCount} label="Won" tone="up" />
        <Record num={stats.lostCount} label="Lost" tone="down" />
        <Record num={stats.pushCount} label="Push" tone="flat" />
        <Record num={stats.openCount} label="Open" tone="flat" />
      </div>

      {/* CLV — closing line value */}
      <ClvBlock stats={stats} />

      {/* By book */}
      <Breakdown title="By Sportsbook" rows={stats.byBook} />
      {/* By sport */}
      <Breakdown title="By Sport" rows={stats.bySport} />
    </div>
  );
};

const ClvBlock = ({ stats }) => {
  if (stats.clvCount === 0) return null;
  const positive = stats.clvAvg >= 0;
  return (
    <div style={{
      padding: 14, borderRadius: 12,
      background: positive ? 'linear-gradient(180deg, rgba(74,222,128,0.08), rgba(74,222,128,0.02))' : 'linear-gradient(180deg, rgba(248,113,113,0.08), rgba(248,113,113,0.02))',
      border: `1px solid ${positive ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.28)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eb-label" style={{ margin: 0 }}>Closing Line Value</div>
        <span
          title="CLV measures how much better your placement price was vs the closing line. Long-term, +CLV correlates with profit more reliably than win rate does."
          style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
            color: 'var(--eb-fg-3)', cursor: 'help',
            padding: '2px 6px', borderRadius: 999,
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--eb-border)',
          }}
        >ⓘ WHY</span>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginTop: 4 }}>
        <div>
          <div className="eb-mono" style={{
            fontFamily: 'var(--eb-font-display)', fontWeight: 900, fontSize: 28,
            color: positive ? 'var(--eb-green)' : 'var(--eb-loss)',
            letterSpacing: '-0.01em', lineHeight: 1.1,
          }}>
            {positive ? '+' : ''}{stats.clvAvg.toFixed(1)}%
          </div>
          <div className="eb-hint" style={{ marginTop: 2 }}>avg vs close</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div className="eb-mono" style={{ fontWeight: 800, fontSize: 16, color: 'var(--eb-fg-1)' }}>
            {stats.clvBeatPct.toFixed(0)}%
          </div>
          <div className="eb-hint">beat the close</div>
          <div className="eb-hint" style={{ color: 'var(--eb-fg-4)', marginTop: 2 }}>
            {stats.clvBeat}/{stats.clvCount} bets
          </div>
        </div>
      </div>
      {/* Mini distribution: dots for last 12 CLV results */}
      {stats.clvRecent.length > 0 && (
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {stats.clvRecent.map((v, i) => (
            <div
              key={i}
              title={`${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
              style={{
                flex: 1, height: 4, borderRadius: 2,
                background: v > 0 ? 'var(--eb-green)' : v < 0 ? 'var(--eb-loss)' : 'var(--eb-fg-4)',
                opacity: 0.6 + Math.min(0.4, Math.abs(v) / 25),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Tally = ({ label, value, tone }) => (
  <div style={{
    padding: '10px 12px', background: 'var(--eb-bg-1)',
    border: '1px solid var(--eb-border)', borderRadius: 10,
  }}>
    <div className="eb-stat-label">{label}</div>
    <div className="eb-mono" style={{
      fontWeight: 800, fontSize: 16, marginTop: 2,
      color: tone === 'up' ? 'var(--eb-win)' : tone === 'down' ? 'var(--eb-loss)' : tone === 'warn' ? 'var(--eb-push)' : 'var(--eb-fg-1)',
    }}>{value}</div>
  </div>
);

const Record = ({ num, label, tone }) => (
  <div>
    <div className="eb-mono" style={{
      fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 22,
      color: tone === 'up' ? 'var(--eb-win)' : tone === 'down' ? 'var(--eb-loss)' : 'var(--eb-fg-1)',
    }}>{num}</div>
    <div className="eb-stat-label" style={{ marginTop: 2 }}>{label}</div>
  </div>
);

const Breakdown = ({ title, rows }) => (
  <div>
    <div className="eb-label" style={{ marginBottom: 8 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map(r => (
        <div key={r.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', background: 'var(--eb-bg-1)',
          border: '1px solid var(--eb-border)', borderRadius: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2, background: r.color, flex: '0 0 8px',
          }} />
          <span style={{ flex: 1, fontWeight: 700, fontSize: 12, color: 'var(--eb-fg-1)' }}>{r.label}</span>
          <span className="eb-hint" style={{ fontVariantNumeric: 'tabular-nums', minWidth: 64, textAlign: 'right' }}>
            {r.wagered ? `$${r.wagered.toFixed(0)}` : '—'}
          </span>
          <span className="eb-mono" style={{
            fontWeight: 800, fontSize: 12, minWidth: 72, textAlign: 'right',
            color: r.profit > 0 ? 'var(--eb-win)' : r.profit < 0 ? 'var(--eb-loss)' : 'var(--eb-fg-2)',
          }}>
            {r.profit === 0 ? '—' : fmtMoney(r.profit, { showSign: true })}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Sparkline = ({ points = [], positive = true }) => {
  if (points.length < 2) return null;
  const W = 280, H = 56, pad = 4;
  const xs = points.map((_, i) => i);
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const path = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = H - pad - ((p - min) / range) * (H - pad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const fill = path + ` L ${W - pad} ${H - pad} L ${pad} ${H - pad} Z`;
  const color = positive ? 'var(--eb-green)' : 'var(--eb-loss)';
  const gradId = `bg-${positive ? 'up' : 'down'}`;
  return (
    <div style={{
      padding: 12, background: 'var(--eb-bg-1)',
      border: '1px solid var(--eb-border)', borderRadius: 10,
    }}>
      <div className="eb-stat-label" style={{ marginBottom: 4 }}>Bankroll over time</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positive ? '#4ade80' : '#f87171'} stopOpacity="0.35" />
            <stop offset="100%" stopColor={positive ? '#4ade80' : '#f87171'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

function computeBankroll(bets, starting) {
  let totalWagered = 0, totalWon = 0, totalLost = 0;
  let wonCount = 0, lostCount = 0, pushCount = 0, openCount = 0;
  let atRisk = 0;

  for (const b of bets) {
    const stake = Number(b.stake) || 0;
    totalWagered += stake;
    if (b.status === 'won')  { totalWon += toWin(stake, b.odds); wonCount++; }
    else if (b.status === 'lost') { totalLost += stake; lostCount++; }
    else if (b.status === 'push' || b.status === 'void') { pushCount++; }
    else { openCount++; atRisk += stake; }
  }

  const netProfit = totalWon - totalLost;
  const settled = wonCount + lostCount;
  const winRatePct = settled ? (wonCount / settled) * 100 : 0;
  const roi = totalWagered ? (netProfit / totalWagered) * 100 : 0;

  // Curve: walk the settled history in reverse chronology (newest first in array → reverse for chronological).
  // We don't have real timestamps in seed data, so simulate a stable cumulative path.
  const settledChrono = bets
    .filter(b => b.status === 'won' || b.status === 'lost')
    .slice()
    .reverse();
  let running = 0;
  const curve = [0];
  for (const b of settledChrono) {
    const stake = Number(b.stake) || 0;
    running += b.status === 'won' ? toWin(stake, b.odds) : -stake;
    curve.push(running);
  }
  if (curve.length < 2) curve.push(running);

  // By sportsbook
  const byBook = SPORTSBOOKS.map(book => {
    const subset = bets.filter(b => b.book === book.id);
    const wag = subset.reduce((s, b) => s + (Number(b.stake) || 0), 0);
    const pf = subset.reduce((s, b) => {
      if (b.status === 'won') return s + toWin(b.stake, b.odds);
      if (b.status === 'lost') return s - b.stake;
      return s;
    }, 0);
    return { id: book.id, label: book.name, color: book.color, wagered: wag, profit: pf };
  });

  // By sport
  const bySport = SPORTS.map(sp => {
    const subset = bets.filter(b => b.sport === sp.id);
    const wag = subset.reduce((s, b) => s + (Number(b.stake) || 0), 0);
    const pf = subset.reduce((s, b) => {
      if (b.status === 'won') return s + toWin(b.stake, b.odds);
      if (b.status === 'lost') return s - b.stake;
      return s;
    }, 0);
    return { id: sp.id, label: `${sp.icon} ${sp.name}`, color: sp.color, wagered: wag, profit: pf };
  }).filter(r => r.wagered > 0);

  return {
    netProfit, totalWagered, totalWon, totalLost, atRisk,
    wonCount, lostCount, pushCount, openCount, winRatePct, roi,
    curve, byBook, bySport,
    ...computeClv(bets),
  };
}

function computeClv(bets) {
  const withClv = bets
    .map(b => ({ b, c: clvPct(b.odds, b.closingOdds) }))
    .filter(x => x.c !== null && !isNaN(x.c));
  if (withClv.length === 0) {
    return { clvAvg: 0, clvBeat: 0, clvBeatPct: 0, clvCount: 0, clvRecent: [] };
  }
  const sum = withClv.reduce((s, x) => s + x.c, 0);
  const beat = withClv.filter(x => x.c > 0).length;
  const recent = withClv.slice(0, 12).reverse().map(x => x.c);
  return {
    clvAvg: sum / withClv.length,
    clvBeat: beat,
    clvCount: withClv.length,
    clvBeatPct: (beat / withClv.length) * 100,
    clvRecent: recent,
  };
}

Object.assign(window, { Bankroll, computeBankroll });
