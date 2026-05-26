// App — top-level state, layout, sport tabs, mobile responsiveness.
const { useState, useEffect, useMemo } = React;

const App = () => {
  const [user, setUser]   = useLocalStorage('eb.user', null);
  const [bets, setBets]   = useLocalStorage('eb.bets', SEED_BETS);
  const [sport, setSport] = useLocalStorage('eb.sport', 'golf');
  const [eventId, setEventId] = useLocalStorage('eb.eventId', GOLF_EVENTS[0].id);
  const [filter, setFilter]   = useLocalStorage('eb.filter', 'active');
  const [mobileTab, setMobileTab] = useState('bets'); // 'bets' | 'add' | 'intel' | 'stats'
  const [plansOpen, setPlansOpen] = useState(false);

  // Tweaks
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  useEffect(() => { applyTweakVars(tweaks); }, [tweaks]);

  const event = useMemo(() => GOLF_EVENTS.find(e => e.id === eventId) || GOLF_EVENTS[0], [eventId]);

  const weatherNote = useMemo(() => {
    if (!event || sport !== 'golf') return '';
    const w = event.weather;
    const signals = computeSignals(w);
    const top = signals.find(s => s.kind === 'edge') || signals[0];
    return `${top.title}: ${top.desc} (Dew ${w.dewPoint}°, real-feel ${w.realFeel}° vs ${w.tempActual}° actual, wind ${w.windMph}mph ${w.windDir}.)`;
  }, [event, sport]);

  const handlePlace = (bet) => {
    setBets(prev => [bet, ...prev]);
  };
  const handleSettle = (id, status) => {
    setBets(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };
  const handleSetClosing = (id, closingOdds) => {
    setBets(prev => prev.map(b => b.id === id ? { ...b, closingOdds } : b));
  };
  const handleDelete = (id) => {
    setBets(prev => prev.filter(b => b.id !== id));
  };
  const signOut = () => setUser(null);

  if (!user) return <Login onSignIn={setUser} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        user={user}
        sport={sport}
        onChangeSport={setSport}
        onSignOut={signOut}
        onOpenPlans={() => setPlansOpen(true)}
      />

      {/* DESKTOP: 3-col grid. MOBILE: stacked with bottom tab nav. */}
      <main className="eb-main">
        {/* Left rail — bankroll */}
        <aside className={`eb-rail eb-rail-left ${mobileTab === 'stats' ? 'eb-mobile-show' : ''}`}>
          <Bankroll bets={bets} startingBank={tweaks.bankStart} />
        </aside>

        {/* Center — bet form + bet list */}
        <section className={`eb-center ${mobileTab === 'bets' || mobileTab === 'add' ? 'eb-mobile-show' : ''}`}>
          <div className={mobileTab === 'add' || mobileTab === 'bets' ? '' : ''}
               style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className={`eb-form-wrap ${mobileTab === 'add' ? 'eb-mobile-only-show' : ''}`}>
              <BetForm
                sport={sport}
                event={event}
                weatherNote={weatherNote}
                onSubmit={handlePlace}
              />
            </div>
            <div className={`eb-list-wrap ${mobileTab === 'bets' ? 'eb-mobile-only-show' : ''}`}>
              <BetList bets={bets} onSettle={handleSettle} onDelete={handleDelete} onSetClosing={handleSetClosing}
                       filter={filter} setFilter={setFilter} />
            </div>
          </div>
        </section>

        {/* Right rail — weather */}
        <aside className={`eb-rail eb-rail-right ${mobileTab === 'intel' ? 'eb-mobile-show' : ''}`}>
          <WeatherPanel
            event={event}
            events={GOLF_EVENTS}
            onChangeEvent={setEventId}
          />
          <SourceCard />
        </aside>
      </main>

      {/* Mobile bottom nav */}
      <nav className="eb-bottom-nav">
        <BNav icon="📊" label="Stats" active={mobileTab === 'stats'} onClick={() => setMobileTab('stats')} />
        <BNav icon="🧾" label="Bets"  active={mobileTab === 'bets'}  onClick={() => setMobileTab('bets')} />
        <BNav icon="＋"  label="Add"   active={mobileTab === 'add'}   onClick={() => setMobileTab('add')} primary />
        <BNav icon="🌦"  label="Intel" active={mobileTab === 'intel'} onClick={() => setMobileTab('intel')} />
      </nav>

      <PlansModal open={plansOpen} onClose={() => setPlansOpen(false)} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakColor
          label="Accent green"
          value={tweaks.accent}
          options={['#4ade80', '#22c55e', '#16a34a', '#86efac', '#10b981']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakRadio
          label="Density"
          value={tweaks.density}
          options={['Cozy','Compact']}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakToggle
          label="Hero glow"
          value={tweaks.glow}
          onChange={(v) => setTweak('glow', v)}
        />
        <TweakSection label="Demo data" />
        <TweakNumber label="Starting bankroll ($)" min={0} max={100000} step={50} value={tweaks.bankStart} onChange={(v) => setTweak('bankStart', v)} />
        <TweakButton label="Reset bets to seed" onClick={() => { if (confirm('Reset to demo seed data?')) setBets(SEED_BETS); }} />
        <TweakButton label="Clear all bets" onClick={() => { if (confirm('Clear ALL bets?')) setBets([]); }} />
      </TweaksPanel>
    </div>
  );
};

// Top bar
const Topbar = ({ user, sport, onChangeSport, onSignOut, onOpenPlans }) => (
  <header className="eb-topbar">
    <div className="eb-topbar-inner">
      <Wordmark size={18} />

      <div className="eb-sport-tabs">
        {SPORTS.map(sp => (
          <button
            key={sp.id}
            onClick={() => onChangeSport(sp.id)}
            className="eb-sport-tab"
            aria-pressed={sport === sp.id}
            disabled={sp.id !== 'golf'}
            title={sp.id !== 'golf' ? 'Coming soon — Golf only in beta' : ''}
          >
            <span style={{ fontSize: 14 }}>{sp.icon}</span>
            <span>{sp.name}</span>
            {sp.id !== 'golf' && <span className="eb-soon">SOON</span>}
          </button>
        ))}
        <button className="eb-sport-tab eb-add" title="Add custom sport">
          <span>＋</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        <button
          onClick={onOpenPlans}
          className="eb-btn"
          style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 800,
            background: 'linear-gradient(180deg, rgba(74,222,128,0.18), rgba(34,197,94,0.08))',
            color: 'var(--eb-green)',
            border: '1px solid rgba(74,222,128,0.40)',
            letterSpacing: '0.04em',
          }}
        >
          ⚡ Upgrade
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="eb-ava" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(user.name || 'J')}</div>
          <div className="eb-user-meta" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{user.name}</span>
            <span className="eb-hint" style={{ fontSize: 10 }}>{user.email}</span>
          </div>
        </div>
        <button className="eb-btn eb-btn-ghost" onClick={onSignOut} style={{ padding: '7px 12px', fontSize: 12 }}>
          Sign out
        </button>
      </div>
    </div>
  </header>
);

const BNav = ({ icon, label, active, onClick, primary }) => (
  <button
    className={`eb-bnav ${active ? 'eb-bnav-active' : ''} ${primary ? 'eb-bnav-primary' : ''}`}
    onClick={onClick}
  >
    <span className="eb-bnav-icon" aria-hidden>{icon}</span>
    <span className="eb-bnav-label">{label}</span>
  </button>
);

// Sources card sits under weather to credit the free data providers wired in.
const SourceCard = () => (
  <div className="eb-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 12,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--eb-fg-1)',
      }}>Data Sources</div>
      <span className="eb-chip" style={{
        background: 'rgba(74,222,128,0.10)', color: 'var(--eb-green)', borderColor: 'rgba(74,222,128,0.3)',
      }}>FREE TIER</span>
    </div>
    <SrcRow color="#86efac" name="Open-Meteo" detail="Wind · Real-feel · Dew · Precip"  badge="No key" />
    <SrcRow color="#60a5fa" name="The Odds API" detail="DK · FD · CZR lines" badge="500/mo free" />
    <SrcRow color="#a78bfa" name="DataGolf"     detail="Rankings · Field data" badge="Free signup" />
    <SrcRow color="#fbbf24" name="ESPN PGA"     detail="Scoreboard · Player stats" badge="No key" />
    <div className="eb-hint" style={{
      marginTop: 4, color: 'var(--eb-fg-3)', lineHeight: 1.5,
      padding: '8px 10px', background: 'var(--eb-bg-1)', borderRadius: 8, border: '1px solid var(--eb-border)',
    }}>
      Drop API keys into <span className="eb-mono" style={{ color: 'var(--eb-green)' }}>src/api.jsx</span> · fetchers are stubbed and ready.
    </div>
  </div>
);

const SrcRow = ({ color, name, detail, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flex: '0 0 6px' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--eb-fg-1)' }}>{name}</div>
      <div className="eb-hint" style={{ color: 'var(--eb-fg-3)', fontSize: 11 }}>{detail}</div>
    </div>
    {badge && (
      <span style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
        padding: '3px 7px', borderRadius: 999,
        background: 'rgba(255,255,255,0.04)', color: 'var(--eb-fg-3)',
        border: '1px solid var(--eb-border)',
      }}>{badge}</span>
    )}
  </div>
);

// ── Tweaks plumbing ────────────────────────────────────────────
const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#4ade80",
  "density": "Cozy",
  "glow": true,
  "bankStart": 1000
}/*EDITMODE-END*/;

function applyTweakVars(t) {
  const root = document.documentElement;
  root.style.setProperty('--eb-green', t.accent);
  // Density: tighten panel paddings via a body class
  document.body.classList.toggle('eb-density-compact', t.density === 'Compact');
  document.body.classList.toggle('eb-glow-off', !t.glow);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
