// BetForm — fast keyboard-friendly entry
// Flow: Sport (preselected) → Book pill → Event → Player autocomplete →
//       Market → Line → Side (O/U/Yes/No) → Odds → Stake → [Place Bet]
// Auto-computes payout. "Pull weather note" button injects current weather signal into notes.

const BetForm = ({ sport, event, weatherNote, onSubmit }) => {
  const [book, setBook] = React.useState('dk');
  const [eventName, setEventName] = React.useState(event?.name || '');
  const [pick, setPick] = React.useState('');
  const [market, setMarket] = React.useState(GOLF_MARKETS[0]);
  const [line, setLine] = React.useState('');
  const [side, setSide] = React.useState('Under');
  const [odds, setOdds] = React.useState('-110');
  const [stake, setStake] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [pickOpen, setPickOpen] = React.useState(false);

  // Sync event name when parent's selected event changes
  React.useEffect(() => { if (event?.name) setEventName(event.name); }, [event?.id]);

  // Side options depend on market
  const hasLine = !/Top|Make|Winner|Leader|3-Ball/i.test(market);
  React.useEffect(() => {
    if (!hasLine && (side === 'Over' || side === 'Under')) setSide('Yes');
    if (hasLine && (side === 'Yes' || side === 'No')) setSide('Under');
  }, [market]); // eslint-disable-line

  const win = toWin(stake, odds);
  const payout = (Number(stake) || 0) + win;
  const valid = book && eventName && pick && market && odds && stake && (!hasLine || line !== '');

  const filteredPlayers = React.useMemo(() => {
    const q = pick.toLowerCase().trim();
    if (!q) return GOLF_PLAYERS.slice(0, 8);
    return GOLF_PLAYERS.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [pick]);

  const submit = (e) => {
    e?.preventDefault();
    if (!valid) return;
    onSubmit({
      id: 'b' + Date.now(),
      sport,
      book,
      event: eventName,
      pick,
      market,
      line: hasLine ? Number(line) : null,
      side,
      odds: Number(odds),
      stake: Number(stake),
      notes,
      placedAt: 'Just now',
      status: 'pending',
    });
    // Reset (keep book + event + market)
    setPick(''); setLine(''); setOdds('-110'); setStake(''); setNotes('');
  };

  return (
    <form onSubmit={submit} className="eb-panel eb-fade-up" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 13,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--eb-fg-1)',
        }}>Place a Bet</div>
        <span className="eb-chip" style={{
          background: 'rgba(74,222,128,0.10)', color: 'var(--eb-green)', borderColor: 'rgba(74,222,128,0.3)',
        }}>
          {SPORTS.find(s => s.id === sport)?.icon} {SPORTS.find(s => s.id === sport)?.name}
        </span>
      </div>

      {/* Sportsbook pill row */}
      <div>
        <label className="eb-label">Sportsbook</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {SPORTSBOOKS.map(b => (
            <button
              type="button"
              key={b.id}
              onClick={() => setBook(b.id)}
              className="eb-btn"
              style={{
                flex: 1, padding: '10px',
                background: book === b.id ? `linear-gradient(180deg, ${b.color}22, ${b.color}10)` : 'var(--eb-input)',
                color: book === b.id ? '#fff' : 'var(--eb-fg-2)',
                border: `1px solid ${book === b.id ? b.color + '88' : 'var(--eb-border-strong)'}`,
                fontWeight: 800, letterSpacing: '0.02em',
                boxShadow: book === b.id ? `0 0 0 3px ${b.color}1c` : 'none',
              }}
            >
              <span style={{ width: 8, height: 8, background: b.color, borderRadius: 2, display: 'inline-block', marginRight: 6 }} />
              {b.short}
            </button>
          ))}
        </div>
      </div>

      {/* Event */}
      <div>
        <label className="eb-label">Event</label>
        <input
          className="eb-input"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="PGA Championship — Round 1"
        />
      </div>

      {/* Player autocomplete */}
      <div style={{ position: 'relative' }}>
        <label className="eb-label">Player / Team</label>
        <input
          className="eb-input"
          value={pick}
          onChange={(e) => { setPick(e.target.value); setPickOpen(true); }}
          onFocus={() => setPickOpen(true)}
          onBlur={() => setTimeout(() => setPickOpen(false), 120)}
          placeholder="Type a name…"
        />
        {pickOpen && filteredPlayers.length > 0 && (
          <div className="eb-card" style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
            marginTop: 4, padding: 4, maxHeight: 260, overflowY: 'auto',
            boxShadow: 'var(--eb-shadow-pop)',
          }}>
            {filteredPlayers.map(p => (
              <button
                type="button"
                key={p.name}
                onMouseDown={(e) => { e.preventDefault(); setPick(p.name); setPickOpen(false); }}
                style={{
                  width: '100%', padding: '8px 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 0, borderRadius: 8,
                  color: 'var(--eb-fg-1)', font: 'inherit', fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="eb-ava" style={{ width: 26, height: 26, fontSize: 11 }}>{initials(p.name)}</span>
                  <span style={{ fontSize: 13 }}>{p.name}</span>
                  <span className="eb-hint" style={{ color: 'var(--eb-fg-4)' }}>{p.country}</span>
                </span>
                <span className="eb-mono" style={{ fontSize: 11, color: 'var(--eb-fg-3)' }}>{p.odds.winner}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Market */}
      <div>
        <label className="eb-label">Market</label>
        <select className="eb-select" value={market} onChange={(e) => setMarket(e.target.value)}>
          {GOLF_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Line + Side */}
      <div style={{ display: 'grid', gridTemplateColumns: hasLine ? '1fr 1fr' : '1fr', gap: 10 }}>
        {hasLine && (
          <div>
            <label className="eb-label">Line</label>
            <input
              className="eb-input eb-mono"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              placeholder="69.5"
              inputMode="decimal"
            />
          </div>
        )}
        <div>
          <label className="eb-label">Side</label>
          <div className="eb-seg eb-seg-accent" style={{ width: '100%' }}>
            {(hasLine ? ['Over', 'Under'] : ['Yes', 'No']).map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setSide(opt)}
                aria-pressed={side === opt}
                style={{ flex: 1 }}
              >{opt}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Odds + Stake */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="eb-label">Odds (American)</label>
          <input
            className="eb-input eb-mono"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            placeholder="-110"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="eb-label">Stake</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--eb-fg-3)', fontWeight: 700,
            }}>$</span>
            <input
              className="eb-input eb-mono"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="50"
              inputMode="decimal"
              style={{ paddingLeft: 22 }}
            />
          </div>
        </div>
      </div>

      {/* Notes + weather quick-attach */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="eb-label" style={{ margin: 0 }}>Notes / edge</span>
          {weatherNote && (
            <button
              type="button"
              className="eb-btn eb-btn-soft"
              onClick={() => setNotes(n => (n ? n + '\n' : '') + weatherNote)}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >+ Weather signal</button>
          )}
        </div>
        <textarea
          className="eb-textarea"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why this bet — model edge, weather, fade-the-public, course fit…"
          style={{ resize: 'vertical', minHeight: 60, fontWeight: 500 }}
        />
      </div>

      {/* Payout calc + submit */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        padding: 12, background: 'var(--eb-bg-1)', border: '1px solid var(--eb-border)', borderRadius: 12,
      }}>
        <Calc label="To Win" value={fmtMoney(win)} tone="up" />
        <Calc label="Payout" value={fmtMoney(payout)} />
        <Calc label="Implied %" value={impliedPct(odds)} />
      </div>

      <button type="submit" className="eb-btn eb-btn-primary" disabled={!valid} style={{ padding: '14px', fontSize: 14 }}>
        Place Bet
      </button>
    </form>
  );
};

const Calc = ({ label, value, tone }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div className="eb-stat-label">{label}</div>
    <div className="eb-mono" style={{
      fontWeight: 800, fontSize: 16,
      color: tone === 'up' ? 'var(--eb-green)' : 'var(--eb-fg-1)',
    }}>{value}</div>
  </div>
);

function impliedPct(odds) {
  const n = Number(odds);
  if (!n || isNaN(n)) return '—';
  const p = n > 0 ? 100 / (n + 100) : Math.abs(n) / (Math.abs(n) + 100);
  return (p * 100).toFixed(1) + '%';
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
}

Object.assign(window, { BetForm, initials });
