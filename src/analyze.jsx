// Analyze — the primary workspace.
// Justin's actual workflow: drop screenshots, paste data, run the methodology,
// get a structured 3-pick card. Each final pick has "Log this bet" to push it
// into the tracker (slip + bankroll).

const ANALYZE_DEFAULTS = {
  tournament: 'Charles Schwab Challenge',
  course: 'TPC Craig Ranch',
  city: 'McKinney, TX',
  raw: '',
};

const METHODOLOGY = [
  'Weather first',
  'Wind only from Windfinder',
  'Humidity, dew point, real-feel, temp from Apple Weather',
  'Tee time wave advantage (AM vs PM)',
  'Course setup + scoring environment',
  'SG APP, SG T2G, OTT, ARG',
  'Round score history + momentum',
  'Recent form as tie-breaker',
  'Avoid GIR unless supporting evidence',
  'Final output: 3 round-score picks ranked',
];

const SLOTS = [
  { id: 'tee-times',   label: 'Tee times',          hint: 'PGA Tour app screenshot' },
  { id: 'windfinder',  label: 'Windfinder',         hint: 'Wind forecast — white bg' },
  { id: 'apple-wx',    label: 'Apple Weather',      hint: 'Real-feel · dew · humidity' },
  { id: 'sg-round',    label: 'SG — Round',         hint: 'DataGolf round stats' },
  { id: 'sg-tourny',   label: 'SG — Tournament',    hint: 'DataGolf full tourny stats' },
  { id: 'dk-lines',    label: 'DK round O/U',       hint: 'DraftKings player props' },
];

const Analyze = ({ onLogBet, onAttachContext }) => {
  const [ctx, setCtx] = useLocalStorage('eb.analyzeCtx', ANALYZE_DEFAULTS);
  const [result, setResult] = useLocalStorage('eb.analyzeResult', null);
  const [helpOpen, setHelpOpen] = useLocalStorage('eb.helpOpen', true);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState('');
  const [methodologyOpen, setMethodologyOpen] = React.useState(false);

  const update = (patch) => setCtx(prev => ({ ...prev, ...patch }));

  const run = async () => {
    setRunning(true); setError(''); setResult(null);
    try {
      const sys = buildSystemPrompt();
      const user = buildUserPrompt(ctx);
      const raw = await window.claude.complete({
        messages: [
          { role: 'user', content: sys + '\n\n---\n\n' + user }
        ]
      });
      const parsed = parseAnalysisJson(raw);
      setResult({ ...parsed, _raw: raw, _at: Date.now() });
    } catch (e) {
      setError(e.message || 'Analysis failed. Try again or trim the input.');
    } finally {
      setRunning(false);
    }
  };

  const clearAll = () => {
    if (!confirm('Clear all analysis inputs and output?')) return;
    setCtx(ANALYZE_DEFAULTS);
    setResult(null);
    SLOTS.forEach(s => {
      try { localStorage.removeItem('image-slot:' + s.id); } catch {}
    });
    location.reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* HOW TO USE — dismissable */}
      {helpOpen && (
        <div className="eb-fade-up" style={{
          padding: '14px 16px', borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(74,222,128,0.10), rgba(34,197,94,0.03))',
          border: '1px solid rgba(74,222,128,0.32)',
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.40)',
            flex: '0 0 32px', fontSize: 16,
          }}>ⓘ</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 14,
              color: 'var(--eb-fg-1)', marginBottom: 6,
            }}>How to use Analyze</div>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li style={{ fontSize: 12.5, color: 'var(--eb-fg-2)', lineHeight: 1.55 }}>
                <b style={{ color: 'var(--eb-fg-1)' }}>Drop screenshots</b> into the 6 slots — tee times, Windfinder, Apple Weather, SG round, SG tournament, DK lines.
              </li>
              <li style={{ fontSize: 12.5, color: 'var(--eb-fg-2)', lineHeight: 1.55 }}>
                <b style={{ color: 'var(--eb-fg-1)' }}>Paste the raw numbers</b> into the data dump box. Be sloppy — the model parses it. Sample text shows the format.
              </li>
              <li style={{ fontSize: 12.5, color: 'var(--eb-fg-2)', lineHeight: 1.55 }}>
                <b style={{ color: 'var(--eb-fg-1)' }}>Hit Run Analysis.</b> Your methodology is baked in — same one you use in ChatGPT. Get back a 3-pick card with reasoning.
              </li>
              <li style={{ fontSize: 12.5, color: 'var(--eb-fg-2)', lineHeight: 1.55 }}>
                <b style={{ color: 'var(--eb-fg-1)' }}>Tap "+ Log this pick"</b> on any final pick to send it to the Track tab with all reasoning attached.
              </li>
            </ol>
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            title="Dismiss"
            style={{
              background: 'transparent', border: 0, padding: 4,
              color: 'var(--eb-fg-3)', cursor: 'pointer',
              fontSize: 18, lineHeight: 1, flex: '0 0 auto',
            }}
          >✕</button>
        </div>
      )}

      {/* HEADER */}
      <div className="eb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="eb-stat-label" style={{ color: 'var(--eb-green)' }}>Analysis workspace</div>
            <h2 style={{
              fontFamily: 'var(--eb-font-display)', fontWeight: 900, fontSize: 24,
              letterSpacing: '-0.01em', margin: '4px 0 0', color: 'var(--eb-fg-1)',
            }}>Methodology → 3-pick card</h2>
            <div className="eb-hint" style={{ marginTop: 4 }}>
              Drop your screenshots, paste raw data, hit Run. Same workflow you already use — structured.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!helpOpen && (
              <button
                onClick={() => setHelpOpen(true)}
                className="eb-btn eb-btn-ghost"
                style={{ padding: '7px 12px', fontSize: 12 }}
                title="Show how-to"
              >ⓘ Help</button>
            )}
            <button
              onClick={() => setMethodologyOpen(o => !o)}
              className="eb-btn eb-btn-ghost"
              style={{ padding: '7px 12px', fontSize: 12 }}
            >
              {methodologyOpen ? 'Hide' : 'View'} methodology
            </button>
          </div>
        </div>

        {methodologyOpen && (
          <div className="eb-fade-up" style={{
            padding: 14, background: 'var(--eb-bg-1)',
            border: '1px solid var(--eb-border)', borderRadius: 12,
          }}>
            <div className="eb-label" style={{ marginBottom: 8 }}>Always applied</div>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {METHODOLOGY.map((m, i) => (
                <li key={i} style={{ color: 'var(--eb-fg-2)', fontSize: 12.5, lineHeight: 1.5 }}>{m}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* STEP 1: SCREENSHOTS */}
      <div className="eb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <StepHeader num="1" title="Drop your screenshots" sub="Drag images onto each slot. Stored locally — never uploaded anywhere." />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}>
          {SLOTS.map(s => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ImageSlotWrapper id={s.id} label={s.label} hint={s.hint} />
            </div>
          ))}
        </div>
      </div>

      {/* STEP 2: CONTEXT */}
      <div className="eb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <StepHeader num="2" title="Context + raw data" sub="The model reads what you paste here. Be sloppy — that's fine." />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
          <div>
            <label className="eb-label">Tournament</label>
            <input className="eb-input" value={ctx.tournament}
                   onChange={(e) => update({ tournament: e.target.value })}
                   placeholder="Charles Schwab Challenge" />
          </div>
          <div>
            <label className="eb-label">Course</label>
            <input className="eb-input" value={ctx.course}
                   onChange={(e) => update({ course: e.target.value })}
                   placeholder="TPC Craig Ranch" />
          </div>
          <div>
            <label className="eb-label">City</label>
            <input className="eb-input" value={ctx.city}
                   onChange={(e) => update({ city: e.target.value })}
                   placeholder="McKinney, TX" />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="eb-label" style={{ margin: 0 }}>Raw data dump</span>
            <span className="eb-hint" style={{ fontSize: 10, color: 'var(--eb-fg-4)' }}>
              Paste tee times · weather numbers · SG values · DK lines · anything
            </span>
          </div>
          <textarea
            className="eb-textarea"
            rows={10}
            value={ctx.raw}
            onChange={(e) => update({ raw: e.target.value })}
            placeholder={SAMPLE_DUMP}
            style={{ resize: 'vertical', minHeight: 180, fontWeight: 500, fontFamily: 'var(--eb-font-mono)', fontSize: 12 }}
          />
        </div>
      </div>

      {/* RUN */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        padding: 14, borderRadius: 14,
        background: 'linear-gradient(180deg, rgba(74,222,128,0.06), rgba(34,197,94,0.02))',
        border: '1px solid rgba(74,222,128,0.25)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={run}
          disabled={running || !ctx.raw.trim()}
          className="eb-btn eb-btn-primary"
          style={{ padding: '14px 22px', fontSize: 14, flex: '1 1 220px' }}
        >
          {running ? <Spinner /> : '▶'} {running ? 'Running methodology…' : 'Run Analysis'}
        </button>
        <button onClick={clearAll} className="eb-btn eb-btn-ghost" style={{ padding: '12px 16px', fontSize: 12 }}>
          Reset all
        </button>
        <div className="eb-hint" style={{ flex: '1 0 100%', color: 'var(--eb-fg-3)', textAlign: 'center', fontSize: 11 }}>
          Output is a model's opinion. Always sanity-check before placing real money.
        </div>
      </div>

      {error && (
        <div style={{
          padding: 14, borderRadius: 12,
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.30)',
          color: 'var(--eb-loss)', fontSize: 13, fontWeight: 600,
        }}>{error}</div>
      )}

      {/* OUTPUT */}
      {result && <AnalysisOutput result={result} onLogBet={onLogBet} ctx={ctx} />}

    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────

const Spinner = () => (
  <span style={{
    display: 'inline-block', width: 14, height: 14,
    border: '2px solid rgba(5,32,16,0.3)', borderTopColor: '#052010',
    borderRadius: '50%', animation: 'ebSpin .6s linear infinite',
  }} />
);

const StepHeader = ({ num, title, sub }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.35)',
      color: 'var(--eb-green)', fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 13,
      flex: '0 0 28px',
    }}>{num}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 14, color: 'var(--eb-fg-1)' }}>{title}</div>
      <div className="eb-hint" style={{ marginTop: 2 }}>{sub}</div>
    </div>
  </div>
);

// Wraps the web component so React doesn't fight the custom element's attrs
const ImageSlotWrapper = ({ id, label, hint }) => {
  return (
    <>
      <div dangerouslySetInnerHTML={{
        __html: `<image-slot id="${id}" placeholder="${label}" shape="rounded" radius="10" style="display:block; aspect-ratio: 4/3; width: 100%;"></image-slot>`
      }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--eb-fg-1)' }}>{label}</span>
        <span className="eb-hint" style={{ fontSize: 10 }}>{hint}</span>
      </div>
    </>
  );
};

const SAMPLE_DUMP = `Tournament: Charles Schwab Challenge
Course: TPC Craig Ranch — McKinney, TX

WEATHER (Apple Weather):
- Temp 82°F, real-feel 91°F (+9 delta), dew 73°F, humidity 84%
- Precip: 30% AM, building to 60% by 4pm
- 78% humidity all day, dew points high

WIND (Windfinder):
- 7-11am: <5 mph, calm
- 11am-2pm: 6-8 mph SSW
- 2pm-5pm: 10-14 mph + gusts to 22

TEE TIMES (just AM names for now):
7:00  Aberg, Schauffele, Hovland
7:11  Jaeger, Spieth, Schmid
7:22  Rahm, Cantlay, Theegala
12:30 Scheffler, McIlroy, Morikawa
12:42 DeChambeau, Koepka, Finau

SG (DataGolf, last 36 rounds):
Aberg:    SG T2G +3.34, SG APP +1.76, OTT +1.08
Jaeger:   SG T2G +2.10, SG APP +1.95
Schmid:   APP +1.42, ARG +0.71, hot momentum
Spieth:   APP +0.88, volatile, boom/bust
Hojgaard: SG APP +1.05, ARG +0.40, birdie machine

DK ROUND 1 O/U:
Aberg     67.5  U -130
Jaeger    68.5  U -110
Schmid    69.5  U -156
Spieth    69.5  U -125
Hovland   68.5  U -115
Scheffler 67.5  U -160
McIlroy   68.5  U -135

I think AM tee times have advantage to go low. Calm wind, soft conditions early before storms build.`;

function buildSystemPrompt() {
  return [
    "You are a sharp golf betting analyst. You apply this exact methodology, in order, with NO deviations:",
    "",
    "1. Weather first",
    "2. Wind ONLY from Windfinder (ignore any other wind source)",
    "3. Humidity, dew point, real-feel, temp ONLY from Apple Weather screenshots",
    "4. Tee-time wave advantage (AM vs PM)",
    "5. Course setup + scoring environment",
    "6. SG categories: APP, T2G, OTT, ARG",
    "7. Round score history + momentum",
    "8. Recent form as tie-breaker only",
    "9. Avoid GIR unless it's only supporting evidence",
    "10. Final output: 3 round-score picks ranked in order",
    "",
    "The output MUST be a single JSON object with no surrounding prose. Schema:",
    "",
    "{",
    '  "headline_take": "1–2 sentence top-level read on the round.",',
    '  "wave_advantage": "AM | PM | Neutral — with one-sentence reasoning",',
    '  "scoring_environment": "Easy | Neutral | Hard — with one-sentence reasoning",',
    '  "strongest_unders": [ { "player": "Name", "reason": "short" } ],',
    '  "strongest_overs":  [ { "player": "Name", "reason": "short" } ],',
    '  "avoids":           [ { "player": "Name", "reason": "short" } ],',
    '  "final_picks": [',
    '    {',
    '      "rank": 1,',
    '      "player": "Name",',
    '      "side": "Under" | "Over",',
    '      "line": 69.5,',
    '      "odds": -156,',
    '      "confidence": "high" | "medium" | "low",',
    '      "projected_score": "67-69",',
    '      "reasons": ["short reason", "short reason"],',
    '      "closing_note": "1-sentence forecast on where this line closes"',
    '    }',
    '  ]',
    "}",
    "",
    "Rules:",
    "- Final picks: ALWAYS exactly 3, ranked safest to most-degenerate.",
    "- Each pick must have a numeric line and numeric American odds (best guess from raw data).",
    "- Strongest unders / overs / avoids: 3–5 entries each.",
    "- Be specific. Cite the data you used. Never hedge with 'depends on'.",
    "- Output ONLY the JSON object. No markdown, no preamble.",
  ].join('\n');
}

function buildUserPrompt(ctx) {
  return [
    `Tournament: ${ctx.tournament}`,
    `Course: ${ctx.course} — ${ctx.city}`,
    '',
    'Raw data attached below. Apply the methodology and return the JSON.',
    '',
    '---',
    ctx.raw.trim(),
  ].join('\n');
}

function parseAnalysisJson(raw) {
  // Strip code fences, find first {...} block
  let s = String(raw || '').trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model returned no JSON. Raw: ' + raw.slice(0, 200));
  const slice = s.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch (e) {
    throw new Error('JSON parse failed: ' + e.message);
  }
}

// ── Output renderer ───────────────────────────────────────

const AnalysisOutput = ({ result, onLogBet, ctx }) => {
  const wave = result.wave_advantage || '';
  const env = result.scoring_environment || '';

  return (
    <div className="eb-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Headline */}
      <div className="eb-panel" style={{
        padding: 18,
        background: 'linear-gradient(180deg, rgba(74,222,128,0.08), rgba(34,197,94,0.02) 60%, var(--eb-panel-2) 100%)',
        border: '1px solid rgba(74,222,128,0.30)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div className="eb-stat-label" style={{ color: 'var(--eb-green)' }}>Read on the round</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag label="Wave" value={wave.split('—')[0].trim()} />
            <Tag label="Scoring" value={env.split('—')[0].trim()} />
          </div>
        </div>
        <p style={{
          margin: '8px 0 0', fontSize: 16, lineHeight: 1.5, color: 'var(--eb-fg-1)',
          fontFamily: 'var(--eb-font-display)', fontWeight: 700,
        }}>{result.headline_take}</p>
        {(wave.includes('—') || env.includes('—')) && (
          <div className="eb-hint" style={{ marginTop: 8, lineHeight: 1.6 }}>
            {wave && <div><b style={{ color: 'var(--eb-fg-2)' }}>Wave —</b> {wave.split('—').slice(1).join('—').trim()}</div>}
            {env && <div><b style={{ color: 'var(--eb-fg-2)' }}>Scoring —</b> {env.split('—').slice(1).join('—').trim()}</div>}
          </div>
        )}
      </div>

      {/* Candidate lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        <CandidateList title="Strongest UNDERS" rows={result.strongest_unders} tone="up" />
        <CandidateList title="Strongest OVERS"  rows={result.strongest_overs}  tone="warn" />
        <CandidateList title="Avoids"           rows={result.avoids}           tone="down" />
      </div>

      {/* Final 3 picks */}
      <div className="eb-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="eb-stat-label" style={{ color: 'var(--eb-green)' }}>Final 3 — ranked</div>
            <div style={{ fontFamily: 'var(--eb-font-display)', fontWeight: 900, fontSize: 22, color: 'var(--eb-fg-1)' }}>
              Today's pick card
            </div>
          </div>
          <div className="eb-hint" style={{ fontSize: 11 }}>{new Date(result._at).toLocaleString()}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(result.final_picks || []).map((p, i) => (
            <FinalPickCard key={i} pick={p} onLogBet={onLogBet} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Tag = ({ label, value }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '4px 10px', borderRadius: 999,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--eb-border)',
    color: 'var(--eb-fg-2)',
  }}>
    <span style={{ color: 'var(--eb-fg-4)' }}>{label}</span>
    <span style={{ color: 'var(--eb-green)' }}>{value || '—'}</span>
  </span>
);

const CandidateList = ({ title, rows = [], tone }) => {
  const color = tone === 'up' ? 'var(--eb-win)' : tone === 'down' ? 'var(--eb-loss)' : 'var(--eb-push)';
  return (
    <div className="eb-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flex: '0 0 6px' }} />
        <div className="eb-label" style={{ margin: 0 }}>{title}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(rows || []).slice(0, 6).map((r, i) => (
          <div key={i} style={{
            padding: '8px 10px', background: 'var(--eb-bg-1)',
            borderRadius: 8, borderLeft: `2px solid ${color}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--eb-fg-1)' }}>{r.player}</div>
            <div className="eb-hint" style={{ fontSize: 11.5, marginTop: 2, color: 'var(--eb-fg-2)', lineHeight: 1.45 }}>{r.reason}</div>
          </div>
        ))}
        {(!rows || rows.length === 0) && (
          <div className="eb-hint" style={{ fontStyle: 'italic' }}>None.</div>
        )}
      </div>
    </div>
  );
};

const FinalPickCard = ({ pick, onLogBet, ctx }) => {
  const conf = (pick.confidence || 'medium').toLowerCase();
  const confColor = conf === 'high' ? 'var(--eb-green)' : conf === 'low' ? 'var(--eb-loss)' : 'var(--eb-push)';
  const sideUp = (pick.side || '').toLowerCase() === 'under';

  return (
    <div className="eb-card eb-pop" style={{
      padding: 16,
      borderLeft: `4px solid ${sideUp ? 'var(--eb-green)' : 'var(--eb-push)'}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          fontFamily: 'var(--eb-font-display)', fontWeight: 900, fontSize: 26,
          color: sideUp ? 'var(--eb-green)' : 'var(--eb-push)',
          minWidth: 32,
        }}>{pick.rank}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 18,
            color: 'var(--eb-fg-1)', letterSpacing: '-0.01em',
          }}>
            {pick.player}
          </div>
          <div className="eb-mono" style={{
            fontSize: 13, fontWeight: 700, color: 'var(--eb-fg-2)', marginTop: 2,
          }}>
            <span style={{ color: sideUp ? 'var(--eb-green)' : 'var(--eb-push)' }}>{pick.side?.toUpperCase()}</span>
            {' '}{pick.line}{' '}
            <span style={{ color: 'var(--eb-fg-3)' }}>·</span>{' '}
            <span style={{ color: 'var(--eb-fg-1)' }}>{formatOdds(pick.odds)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.16em',
            padding: '3px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${confColor}55`, color: confColor,
          }}>{(pick.confidence || 'medium').toUpperCase()}</span>
          {pick.projected_score && (
            <span className="eb-hint" style={{ fontSize: 11 }}>
              Proj <span className="eb-mono" style={{ color: 'var(--eb-fg-1)', fontWeight: 700 }}>{pick.projected_score}</span>
            </span>
          )}
        </div>
      </div>

      {pick.reasons && pick.reasons.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pick.reasons.map((r, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--eb-fg-2)', lineHeight: 1.5 }}>{r}</li>
          ))}
        </ul>
      )}

      {pick.closing_note && (
        <div style={{
          padding: '8px 10px', background: 'var(--eb-bg-1)', borderRadius: 8,
          fontSize: 12, fontStyle: 'italic', color: 'var(--eb-fg-3)', lineHeight: 1.5,
          borderLeft: '2px solid var(--eb-border-strong)',
        }}>“{pick.closing_note}”</div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => onLogBet(pick, ctx)}
          className="eb-btn eb-btn-soft"
          style={{ padding: '8px 14px', fontSize: 12 }}
        >+ Log this pick</button>
        <button
          onClick={() => navigator.clipboard?.writeText(
            `${pick.rank}. ${pick.player} ${pick.side?.toUpperCase()} ${pick.line} (${formatOdds(pick.odds)})\n${(pick.reasons||[]).map(r=>'• '+r).join('\n')}`
          )}
          className="eb-btn eb-btn-ghost"
          style={{ padding: '8px 14px', fontSize: 12 }}
        >Copy</button>
      </div>
    </div>
  );
};

Object.assign(window, { Analyze, AnalysisOutput });
