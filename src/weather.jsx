// Weather Intelligence panel — golf-focused signals.
// Reads weather struct on the selected event; computes "edge" cues per Justin's heuristics:
//   - High dew point (>=65°F)
//   - Real feel >> actual (delta >=6°F)
//   - Wind elevated (>=12mph sustained)
// Source labels distinguish Windfinder vs Apple Weather.

const WeatherPanel = ({ event, onChangeEvent, events = [] }) => {
  const [liveWeather, setLiveWeather] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshErr, setRefreshErr] = React.useState('');

  React.useEffect(() => { setLiveWeather(null); setRefreshErr(''); }, [event?.id]);

  if (!event) {
    return (
      <div className="eb-panel" style={{ padding: 18 }}>
        <PanelHeader title="Weather Intel" />
        <div className="eb-hint" style={{ padding: '12px 4px' }}>
          Select an event to load conditions.
        </div>
      </div>
    );
  }

  const w = liveWeather || event.weather;
  const realFeelDelta = w.realFeel - w.tempActual;
  const signals = computeSignals(w);

  const refresh = async () => {
    if (!event.coords || !window.EB_API) {
      setRefreshErr('No coords for this event.');
      return;
    }
    setRefreshing(true); setRefreshErr('');
    try {
      const live = await window.EB_API.weather(event.coords);
      setLiveWeather(live);
    } catch (e) {
      setRefreshErr(e.message || 'Fetch failed');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="eb-panel eb-fade-up" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelHeader
        title="Weather Intel"
        right={<span className="eb-chip" style={{ background: 'rgba(74,222,128,0.10)', color: 'var(--eb-green)', borderColor: 'rgba(74,222,128,0.3)' }}>⛳ Golf</span>}
      />

      {/* Event picker */}
      <select
        className="eb-select"
        value={event.id}
        onChange={(e) => onChangeEvent(e.target.value)}
        style={{ fontSize: 13 }}
      >
        {events.map(ev => (
          <option key={ev.id} value={ev.id}>{ev.name} — {ev.course}</option>
        ))}
      </select>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <div>
          <div className="eb-hint" style={{ color: 'var(--eb-fg-3)' }}>{event.city}</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--eb-fg-1)', marginTop: 2 }}>{event.course}</div>
          <div className="eb-hint" style={{ marginTop: 2 }}>{event.tee}</div>
        </div>
        {event.isLive && <span className="eb-chip eb-chip-live">Live</span>}
      </div>

      {/* Top reading row — actual / real-feel / dew */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        background: 'var(--eb-bg-1)', border: '1px solid var(--eb-border)', borderRadius: 12, padding: 12,
      }}>
        <Reading label="Actual" value={`${w.tempActual}°`} sub="F" />
        <Reading
          label="Real Feel"
          value={`${w.realFeel}°`}
          sub="F"
          tone={realFeelDelta >= 6 ? 'hot' : null}
          delta={realFeelDelta > 0 ? `+${realFeelDelta}°` : `${realFeelDelta}°`}
        />
        <Reading label="Dew Point" value={`${w.dewPoint}°`} sub="F" tone={w.dewPoint >= 65 ? 'hot' : null} />
      </div>

      {/* Wind + humidity + precip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <WindCard wind={w} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MiniMetric icon={<DropIcon />} label="Humidity" value={`${w.humidity}%`} tone={w.humidity >= 75 ? 'warn' : null} />
          <MiniMetric icon={<CloudIcon />} label="Precip" value={`${w.precipPct}%`} tone={w.precipPct >= 40 ? 'warn' : null} />
        </div>
      </div>

      {/* Signal */}
      <SignalBlock signals={signals} />

      {/* Sources */}
      <div className="eb-hint" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 8, borderTop: '1px solid var(--eb-divider)',
      }}>
        <span>Wind · <span style={{ color: 'var(--eb-green)' }}>{w.source.wind}</span></span>
        <span>Real-feel · <span style={{ color: 'var(--eb-green)' }}>{w.source.temp}</span></span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div className="eb-hint" style={{ color: 'var(--eb-fg-4)' }}>{w.updated}</div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="eb-btn eb-btn-soft"
          style={{ padding: '4px 10px', fontSize: 11 }}
          title="Pull live conditions from Open-Meteo"
        >
          {refreshing ? 'Pulling…' : '↻ Live pull'}
        </button>
      </div>
      {refreshErr && (
        <div style={{
          fontSize: 11, color: 'var(--eb-loss)', fontWeight: 600,
          padding: '6px 10px', background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.22)', borderRadius: 8,
        }}>{refreshErr}</div>
      )}
    </div>
  );
};

const PanelHeader = ({ title, right }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }}>
    <div style={{
      fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 13,
      letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--eb-fg-1)',
    }}>{title}</div>
    {right}
  </div>
);

const Reading = ({ label, value, sub, tone, delta }) => {
  const color = tone === 'hot' ? 'var(--eb-loss)' : 'var(--eb-fg-1)';
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div className="eb-stat-label">{label}</div>
      <div className="eb-mono" style={{ fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 24, color, lineHeight: 1.1 }}>
        {value}
        <span style={{ fontSize: 11, color: 'var(--eb-fg-3)', marginLeft: 2 }}>{sub}</span>
      </div>
      {delta && (
        <div style={{ fontSize: 10, fontWeight: 700, color: tone === 'hot' ? 'var(--eb-loss)' : 'var(--eb-fg-3)' }}>{delta} vs actual</div>
      )}
    </div>
  );
};

const MiniMetric = ({ icon, label, value, tone }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '10px 12px', background: 'var(--eb-bg-1)',
    border: '1px solid var(--eb-border)', borderRadius: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--eb-fg-2)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {icon}{label}
    </div>
    <div className="eb-mono" style={{ fontWeight: 800, fontSize: 16, color: tone === 'warn' ? 'var(--eb-push)' : 'var(--eb-fg-1)' }}>{value}</div>
  </div>
);

const WindCard = ({ wind }) => (
  <div style={{
    padding: '10px 12px', background: 'var(--eb-bg-1)',
    border: '1px solid var(--eb-border)', borderRadius: 10,
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <Compass dir={wind.windDirDeg} />
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="eb-stat-label">Wind</div>
      <div className="eb-mono" style={{ fontWeight: 800, fontSize: 16, color: wind.windMph >= 15 ? 'var(--eb-push)' : 'var(--eb-fg-1)' }}>
        {wind.windMph} <span style={{ fontSize: 10, color: 'var(--eb-fg-3)' }}>mph</span>
      </div>
      <div className="eb-hint">{wind.windDir} · gust {wind.windGust}</div>
    </div>
  </div>
);

const Compass = ({ dir = 0 }) => (
  <div style={{ position: 'relative', width: 42, height: 42, flex: '0 0 42px' }}>
    <svg width="42" height="42" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="19" fill="rgba(255,255,255,0.02)" stroke="var(--eb-border-strong)" />
      <text x="21" y="9" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--eb-fg-3)">N</text>
      <text x="21" y="38" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--eb-fg-4)">S</text>
      <g transform={`rotate(${dir} 21 21)`}>
        <path d="M21 7 L25 22 L21 19 L17 22 Z" fill="var(--eb-green)" />
      </g>
    </svg>
  </div>
);

const DropIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2c-4 6-7 9.5-7 13a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/>
  </svg>
);
const CloudIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 9a4 4 0 0 1-1 7.86V18H7z"/>
  </svg>
);

// Heuristic engine
function computeSignals(w) {
  const realFeelDelta = w.realFeel - w.tempActual;
  const out = [];

  // Suppressed scoring signal (Justin's primary edge)
  if (w.dewPoint >= 65 && realFeelDelta >= 6) {
    out.push({
      kind: 'edge',
      title: 'Suppressed-scoring signal',
      desc: `Dew point ${w.dewPoint}° + real-feel ${realFeelDelta > 0 ? '+' + realFeelDelta : realFeelDelta}° over actual. Heavy air, ball won't fly. Lean UNDER on round totals, UNDER on birdies.`,
    });
  } else if (w.dewPoint >= 60 && realFeelDelta >= 4) {
    out.push({
      kind: 'lean',
      title: 'Mild suppressed-scoring lean',
      desc: `Dew point ${w.dewPoint}°, real-feel +${realFeelDelta}°. Conditions slightly thick — directional only.`,
    });
  }

  if (w.windMph >= 18 || w.windGust >= 25) {
    out.push({
      kind: 'edge',
      title: 'Wind premium',
      desc: `Sustained ${w.windMph}mph, gust ${w.windGust}mph from ${w.windDir}. Ball-strikers + low-flight players gain.`,
    });
  } else if (w.windMph >= 12) {
    out.push({
      kind: 'lean',
      title: 'Wind in play',
      desc: `${w.windMph}mph from ${w.windDir} — meaningful for approach shots but not dominant.`,
    });
  }

  if (w.precipPct >= 50) {
    out.push({
      kind: 'warn',
      title: 'Precip risk',
      desc: `${w.precipPct}% chance — delay/suspension risk, watch live action.`,
    });
  }

  if (out.length === 0) {
    out.push({ kind: 'neutral', title: 'Neutral conditions', desc: 'Nothing notable in the weather. Lean on talent + course fit.' });
  }
  return out;
}

const SignalBlock = ({ signals }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {signals.map((s, i) => {
      const palette = {
        edge:    { bg: 'rgba(74,222,128,0.10)',  br: 'rgba(74,222,128,0.32)',  fg: 'var(--eb-green)',  badge: 'EDGE' },
        lean:    { bg: 'rgba(96,165,250,0.10)',  br: 'rgba(96,165,250,0.28)',  fg: 'var(--eb-info)',   badge: 'LEAN' },
        warn:    { bg: 'rgba(251,191,36,0.10)',  br: 'rgba(251,191,36,0.30)',  fg: 'var(--eb-push)',   badge: 'WARN' },
        neutral: { bg: 'rgba(255,255,255,0.03)', br: 'var(--eb-border)',       fg: 'var(--eb-fg-2)',   badge: 'NEUTRAL' },
      }[s.kind];
      return (
        <div key={i} style={{
          padding: 12, borderRadius: 10,
          background: palette.bg, border: `1px solid ${palette.br}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.16em',
              color: palette.fg,
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(0,0,0,0.25)',
            }}>{palette.badge}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: palette.fg }}>{s.title}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--eb-fg-2)', lineHeight: 1.5 }}>{s.desc}</div>
        </div>
      );
    })}
  </div>
);

Object.assign(window, { WeatherPanel, computeSignals });
