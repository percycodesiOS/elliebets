// BetList — shows active + history bets with quick settle controls
const BetList = ({ bets, onSettle, onDelete, onSetClosing, filter, setFilter }) => {
  const active = bets.filter(b => b.status === 'pending' || b.status === 'live');
  const settled = bets.filter(b => b.status !== 'pending' && b.status !== 'live');

  const filtered = (filter === 'active' ? active : filter === 'settled' ? settled : bets);

  return (
    <div className="eb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{
          fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 13,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--eb-fg-1)',
        }}>Bet Slip</div>
        <div className="eb-seg">
          {['active','settled','all'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              aria-pressed={filter === opt}
              style={{ textTransform: 'capitalize' }}
            >
              {opt} {opt === 'active' && <span style={{ color: 'var(--eb-fg-4)' }}>({active.length})</span>}
              {opt === 'settled' && <span style={{ color: 'var(--eb-fg-4)' }}>({settled.length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center', color: 'var(--eb-fg-3)',
            background: 'var(--eb-bg-1)', border: '1px dashed var(--eb-border-strong)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>○</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No bets here yet.</div>
            <div className="eb-hint" style={{ marginTop: 4 }}>Place one on the left to see it appear.</div>
          </div>
        )}
        {filtered.map(b => <BetCard key={b.id} bet={b} onSettle={onSettle} onDelete={onDelete} onSetClosing={onSetClosing} />)}
      </div>
    </div>
  );
};

const BetCard = ({ bet, onSettle, onDelete, onSetClosing }) => {
  const [closingEdit, setClosingEdit] = React.useState(false);
  const [closingDraft, setClosingDraft] = React.useState(bet.closingOdds ?? '');
  React.useEffect(() => { setClosingDraft(bet.closingOdds ?? ''); }, [bet.closingOdds]);

  const book = SPORTSBOOKS.find(s => s.id === bet.book);
  const win = toWin(bet.stake, bet.odds);
  const isOpen = bet.status === 'pending' || bet.status === 'live';
  const isSettled = !isOpen;
  const profit = bet.status === 'won' ? win
              : bet.status === 'lost' ? -bet.stake
              : 0;

  const clv = clvPct(bet.odds, bet.closingOdds);
  const hasClv = clv !== null && !isNaN(clv);

  const saveClosing = () => {
    const v = closingDraft === '' ? null : Number(closingDraft);
    if (v !== null && (isNaN(v) || v === 0)) { setClosingEdit(false); return; }
    onSetClosing(bet.id, v);
    setClosingEdit(false);
  };

  const statusEl = (() => {
    if (bet.status === 'live')    return <span className="eb-chip eb-chip-live">Live</span>;
    if (bet.status === 'pending') return <span className="eb-chip">Pending</span>;
    if (bet.status === 'won')     return <span className="eb-chip eb-chip-win">Won · +{fmtMoney(win).replace('$','$').replace('−','')}</span>;
    if (bet.status === 'lost')    return <span className="eb-chip eb-chip-loss">Lost · −{fmtMoney(bet.stake).replace('−','').replace('$','$')}</span>;
    if (bet.status === 'push')    return <span className="eb-chip eb-chip-push">Push</span>;
    if (bet.status === 'void')    return <span className="eb-chip">Void</span>;
    return <span className="eb-chip">{bet.status}</span>;
  })();

  return (
    <div className="eb-card eb-pop" style={{
      padding: 14,
      borderLeft: `3px solid ${book?.color || 'var(--eb-border)'}`,
      opacity: bet.status === 'lost' || bet.status === 'void' ? 0.85 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div className="eb-ava">{initials(bet.pick)}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--eb-fg-1)' }}>{bet.pick}</span>
            <span className="eb-hint">·</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--eb-fg-2)' }}>
              {bet.side}{bet.line !== null && bet.line !== undefined ? ` ${bet.line}` : ''}
            </span>
            <span className="eb-hint">·</span>
            <span className="eb-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--eb-fg-2)' }}>{formatOdds(bet.odds)}</span>
            {hasClv && <ClvBadge clv={clv} />}
            <span style={{ marginLeft: 'auto' }}>{statusEl}</span>
          </div>

          <div className="eb-hint" style={{ marginTop: 4 }}>
            {bet.market} · {bet.event}
          </div>

          {bet.notes && (
            <div style={{
              marginTop: 8, padding: '8px 10px',
              background: 'var(--eb-bg-1)', borderRadius: 8,
              fontSize: 12, color: 'var(--eb-fg-2)', lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              borderLeft: '2px solid var(--eb-border-strong)',
            }}>{bet.notes}</div>
          )}

          <div style={{
            marginTop: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Stat label="Stake" value={fmtMoney(bet.stake)} />
              <Stat label="To Win" value={fmtMoney(win)} tone="up" />
              {bet.status === 'won' && <Stat label="Profit" value={fmtMoney(profit, { showSign: true })} tone="up" />}
              {bet.status === 'lost' && <Stat label="Loss" value={fmtMoney(profit, { showSign: true })} tone="down" />}
              {isSettled && (
                <ClosingOddsControl
                  bet={bet}
                  editing={closingEdit}
                  draft={closingDraft}
                  setDraft={setClosingDraft}
                  onStartEdit={() => setClosingEdit(true)}
                  onSave={saveClosing}
                  onCancel={() => { setClosingDraft(bet.closingOdds ?? ''); setClosingEdit(false); }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="eb-hint" style={{
                padding: '3px 8px', borderRadius: 999,
                background: (book?.color || '#fff') + '14',
                color: book?.color || 'var(--eb-fg-2)',
                fontWeight: 800, fontSize: 10, letterSpacing: '0.06em',
              }}>{book?.short}</span>
              <span className="eb-hint">{bet.placedAt}</span>
            </div>
          </div>

          {isOpen && (
            <div style={{
              marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--eb-divider)',
              display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <span className="eb-label" style={{ margin: 0, marginRight: 4 }}>Settle:</span>
              <button className="eb-btn eb-btn-soft" onClick={() => onSettle(bet.id, 'won')} style={{ padding: '5px 12px', fontSize: 11 }}>
                Won
              </button>
              <button
                className="eb-btn"
                onClick={() => onSettle(bet.id, 'lost')}
                style={{
                  padding: '5px 12px', fontSize: 11,
                  background: 'rgba(248,113,113,0.10)', color: 'var(--eb-loss)',
                  border: '1px solid rgba(248,113,113,0.25)', fontWeight: 700,
                }}
              >Lost</button>
              <button
                className="eb-btn"
                onClick={() => onSettle(bet.id, 'push')}
                style={{
                  padding: '5px 12px', fontSize: 11,
                  background: 'rgba(251,191,36,0.10)', color: 'var(--eb-push)',
                  border: '1px solid rgba(251,191,36,0.25)', fontWeight: 700,
                }}
              >Push</button>
              <button
                className="eb-btn"
                onClick={() => onSettle(bet.id, 'void')}
                style={{
                  padding: '5px 12px', fontSize: 11,
                  background: 'transparent', color: 'var(--eb-fg-3)',
                  border: '1px solid var(--eb-border-strong)', fontWeight: 700,
                }}
              >Void</button>
              <button
                className="eb-btn"
                onClick={() => { if (confirm('Delete this bet permanently?')) onDelete(bet.id); }}
                style={{
                  marginLeft: 'auto',
                  padding: '5px 8px', fontSize: 11,
                  background: 'transparent', color: 'var(--eb-fg-4)',
                  border: '1px solid transparent', fontWeight: 700,
                }}
                title="Delete"
              >🗑</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CLV badge — green if positive (beat the close), red if negative
const ClvBadge = ({ clv }) => {
  const positive = clv > 0;
  const neutral = Math.abs(clv) < 0.5;
  const bg = neutral ? 'rgba(255,255,255,0.05)' : positive ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.10)';
  const bd = neutral ? 'var(--eb-border)' : positive ? 'rgba(74,222,128,0.32)' : 'rgba(248,113,113,0.30)';
  const fg = neutral ? 'var(--eb-fg-3)' : positive ? 'var(--eb-green)' : 'var(--eb-loss)';
  return (
    <span
      title={`Closing Line Value: ${positive ? '+' : ''}${clv.toFixed(1)}% vs close`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
        background: bg, border: `1px solid ${bd}`, color: fg,
        fontFamily: 'var(--eb-font-mono)',
      }}
    >
      CLV {positive ? '+' : ''}{clv.toFixed(1)}%
    </span>
  );
};

const ClosingOddsControl = ({ bet, editing, draft, setDraft, onStartEdit, onSave, onCancel }) => {
  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--eb-fg-4)', fontWeight: 700 }}>Close</span>
        <input
          className="eb-input eb-mono"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
          placeholder="-110"
          autoFocus
          style={{ width: 64, padding: '4px 6px', fontSize: 12 }}
        />
        <button className="eb-btn eb-btn-soft" onClick={onSave} style={{ padding: '4px 8px', fontSize: 10 }}>✓</button>
        <button className="eb-btn" onClick={onCancel} style={{
          padding: '4px 6px', fontSize: 10,
          background: 'transparent', color: 'var(--eb-fg-3)', border: '1px solid var(--eb-border)',
        }}>✕</button>
      </div>
    );
  }
  if (bet.closingOdds != null && bet.closingOdds !== '') {
    return (
      <button
        onClick={onStartEdit}
        title="Edit closing odds"
        style={{
          background: 'transparent', border: 0, padding: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--eb-fg-4)', fontWeight: 700 }}>Close</span>
        <span className="eb-mono" style={{ fontWeight: 800, fontSize: 13, color: 'var(--eb-fg-2)' }}>{formatOdds(bet.closingOdds)}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onStartEdit}
      className="eb-btn"
      style={{
        padding: '4px 8px', fontSize: 10, fontWeight: 700,
        background: 'transparent', color: 'var(--eb-fg-3)',
        border: '1px dashed var(--eb-border-strong)',
      }}
    >+ Closing line</button>
  );
};

const Stat = ({ label, value, tone }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--eb-fg-4)', fontWeight: 700 }}>{label}</span>
    <span className="eb-mono" style={{
      fontWeight: 800, fontSize: 13,
      color: tone === 'up' ? 'var(--eb-win)' : tone === 'down' ? 'var(--eb-loss)' : 'var(--eb-fg-1)',
    }}>{value}</span>
  </div>
);

Object.assign(window, { BetList, BetCard, ClvBadge });
