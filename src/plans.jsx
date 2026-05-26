// Plans / Pricing modal
const PlansModal = ({ open, onClose, currentPlan = 'beta' }) => {
  const [billing, setBilling] = React.useState('annual'); // 'monthly' | 'annual'
  if (!open) return null;

  const tiers = [
    {
      id: 'beta',
      name: 'Beta',
      tag: 'Current',
      price: { monthly: 0, annual: 0 },
      desc: 'Invite-only access during early access.',
      cta: 'Your current plan',
      ctaDisabled: true,
      features: [
        'Manual bet entry — unlimited',
        'Bankroll tracking + P/L analytics',
        'Weather signals for golf',
        'DK · FD · CZR price tracking (manual)',
        'Single device',
      ],
      highlight: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      tag: 'For sharps',
      price: { monthly: 79, annual: 790 },
      desc: 'Live data feeds, multi-sport, sync everywhere.',
      cta: 'Upgrade to Pro',
      ctaDisabled: false,
      features: [
        'Everything in Beta',
        'Live odds: DK · FD · CZR auto-sync',
        'NFL · NBA · MLB · NHL · Soccer',
        'Apple Weather + Windfinder live pulls',
        'Cloud sync — desktop + mobile',
        'CSV export of bet history',
        'Email/SMS line-move alerts',
      ],
      highlight: true,
    },
    {
      id: 'edge',
      name: 'Edge',
      tag: 'Founder',
      price: { monthly: 299, annual: 2499 },
      desc: 'For the operator who treats this like a business.',
      cta: 'Apply for Edge',
      ctaDisabled: false,
      features: [
        'Everything in Pro',
        'DataGolf SG + ShotLink integration',
        'Closing line value (CLV) tracking',
        'Custom heuristic builder (your signals)',
        'Model backtesting on 5 years of data',
        'Private Discord + 1:1 onboarding',
        'API access for own dashboards',
        'White-glove tax-doc export',
      ],
      highlight: false,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,9,8,0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'grid', placeItems: 'center',
        padding: 20, overflow: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="eb-fade-up"
        style={{
          width: '100%', maxWidth: 1080,
          background: 'linear-gradient(180deg, #131c19 0%, #0e1613 100%)',
          border: '1px solid var(--eb-border-strong)',
          borderRadius: 24,
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          padding: 32,
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="eb-btn-icon"
          style={{ position: 'absolute', top: 18, right: 18 }}
          aria-label="Close"
        >✕</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="eb-stat-label" style={{ color: 'var(--eb-green)', letterSpacing: '0.2em' }}>Pricing</div>
          <h2 style={{
            margin: '6px 0 8px',
            fontFamily: 'var(--eb-font-display)',
            fontWeight: 900, fontSize: 36, letterSpacing: '-0.015em',
            color: 'var(--eb-fg-1)',
          }}>
            An <span style={{ color: 'var(--eb-green)' }}>edge</span> worth paying for.
          </h2>
          <p style={{ color: 'var(--eb-fg-2)', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
            Built by one bettor, for serious bettors. Cancel anytime. Founders' rates locked for life.
          </p>

          {/* Billing toggle */}
          <div className="eb-seg" style={{ marginTop: 18, padding: 4 }}>
            <button onClick={() => setBilling('monthly')} aria-pressed={billing === 'monthly'}>Monthly</button>
            <button onClick={() => setBilling('annual')} aria-pressed={billing === 'annual'}>
              Annual <span style={{ color: 'var(--eb-green)', marginLeft: 4 }}>−17%</span>
            </button>
          </div>
        </div>

        {/* Tiers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {tiers.map(t => (
            <div key={t.id} style={{
              position: 'relative',
              padding: 22,
              background: t.highlight
                ? 'linear-gradient(180deg, rgba(74,222,128,0.10), rgba(34,197,94,0.02) 60%)'
                : 'var(--eb-panel-2)',
              border: `1px solid ${t.highlight ? 'rgba(74,222,128,0.45)' : 'var(--eb-border-strong)'}`,
              borderRadius: 16,
              boxShadow: t.highlight ? '0 20px 50px rgba(34,197,94,0.18)' : 'none',
            }}>
              {t.highlight && (
                <span style={{
                  position: 'absolute', top: -10, left: 22,
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.16em',
                  padding: '4px 10px', borderRadius: 999,
                  background: 'linear-gradient(180deg, #4ade80, #22c55e)',
                  color: '#052010',
                }}>MOST POPULAR</span>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  fontFamily: 'var(--eb-font-display)', fontWeight: 800, fontSize: 20,
                  color: 'var(--eb-fg-1)',
                }}>{t.name}</div>
                <span className="eb-chip" style={{
                  background: t.highlight ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.05)',
                  color: t.highlight ? 'var(--eb-green)' : 'var(--eb-fg-2)',
                  borderColor: t.highlight ? 'rgba(74,222,128,0.32)' : 'var(--eb-border)',
                }}>{t.tag}</span>
              </div>

              <div style={{ margin: '14px 0 6px' }}>
                <span className="eb-mono" style={{
                  fontFamily: 'var(--eb-font-display)', fontWeight: 900, fontSize: 42,
                  color: 'var(--eb-fg-1)', letterSpacing: '-0.02em',
                }}>
                  ${billing === 'annual' ? Math.round(t.price.annual / 12) : t.price.monthly}
                </span>
                <span style={{ color: 'var(--eb-fg-3)', fontWeight: 700, fontSize: 14, marginLeft: 4 }}>
                  /mo
                </span>
              </div>
              <div className="eb-hint" style={{ minHeight: 16 }}>
                {billing === 'annual' && t.price.annual > 0 && (
                  <>Billed annually · <span style={{ color: 'var(--eb-fg-2)' }}>${t.price.annual.toLocaleString()}/yr</span></>
                )}
              </div>
              <div style={{ color: 'var(--eb-fg-2)', fontSize: 13, marginTop: 8, minHeight: 36 }}>
                {t.desc}
              </div>

              <button
                className={t.highlight ? 'eb-btn eb-btn-primary' : 'eb-btn eb-btn-ghost'}
                disabled={t.ctaDisabled}
                style={{ width: '100%', marginTop: 14, padding: '12px' }}
                onClick={() => { if (!t.ctaDisabled) alert(`Real billing wires up to Stripe — ${t.name} selected.`); }}
              >
                {t.cta}
              </button>

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {t.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--eb-fg-2)' }}>
                    <Check />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, color: 'var(--eb-fg-4)', fontSize: 11 }}>
          Stripe billing. No data sold, no ads, no affiliate kickbacks from sportsbooks. You pay, we work for you.
        </div>
      </div>
    </div>
  );
};

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--eb-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 14px', marginTop: 2 }}>
    <path d="M5 12l5 5 9-11" />
  </svg>
);

Object.assign(window, { PlansModal });
