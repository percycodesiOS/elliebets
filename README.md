# EllieBets

A private, invite-only sports betting workflow tool. Live weather signals, multi-book line tracking, closing-line value (CLV) analytics, and the bankroll math that books don't show you. Built for one bettor — by that bettor.

**Live at:** https://percycodesios.github.io/elliebets/

---

## What It Does

### 📊 Place a bet in 15 seconds
Pick the sportsbook (DraftKings, FanDuel, Caesars). Type the player's name — autocomplete finds them. Pick a market, enter the line, the side, the odds, the stake. Hit place. Done.

The implied probability, payout, and to-win update live as you type. Notes field auto-populates with the current weather signal when you click "+ Weather signal."

### 💰 Bankroll, never lied to
Net profit. ROI. Win rate. Total wagered. At risk. By sportsbook. By sport. Every settled bet feeds the curve. No more "I think I'm up" — you'll know.

### 🎯 CLV (Closing Line Value) tracking
The single most predictive long-term metric in sharp betting. After each bet settles, log the closing line. EllieBets computes your edge per bet and your rolling average across all settled bets — green if you're beating the market, red if you're not.

**Why it matters:** win rate fluctuates with variance. CLV does not. If you consistently beat the close, you're +EV regardless of short-term losses.

### ⛅ Weather Intelligence (Golf)
The dew point. The real-feel delta vs actual temp. The wind from a known direction. The precipitation risk. All on one screen, refreshing live from Open-Meteo (no API key needed).

Auto-derived signals tell you when conditions match an edge:
- **EDGE — Suppressed scoring** when dew ≥65°F AND real-feel +6°F above actual
- **EDGE — Wind premium** when sustained ≥18mph or gusts ≥25mph
- **LEAN** for milder versions
- **WARN — Precip risk** when chance ≥50%
- **NEUTRAL** when nothing notable

### 🚪 Invite-only access
The marketing landing at `index.html` lives publicly. The app at `EllieBets.html` is invite-only — code `ELLIE-2026` for the demo. Real deployment swaps the mock auth for Firebase Google sign-in.

---

## Repo Layout

| File | Purpose |
|---|---|
| `index.html` | Public marketing landing — what visitors see first |
| `EllieBets.html` | The app. Invite-only |
| `src/styles.css` | Design tokens (dark green / slate) |
| `src/layout.css` | App grid, topbar, mobile bottom nav |
| `src/landing.css` | Marketing page styles |
| `src/app.jsx` | App shell, state, layout |
| `src/login.jsx` | Sign-in screen |
| `src/bet-form.jsx` | Fast bet entry |
| `src/bet-list.jsx` | Bet slip + CLV |
| `src/bankroll.jsx` | P/L · ROI · CLV · breakdowns |
| `src/weather.jsx` | Weather intel + edge signals |
| `src/data.jsx` | Mock data, odds helpers, CLV math |
| `src/api.jsx` | Free-tier API fetchers (Open-Meteo, Odds API, DataGolf, ESPN) |
| `src/plans.jsx` | Pricing modal (Beta / Pro / Edge tiers) |
| `src/storage.jsx` | localStorage hook |
| `src/logo.jsx` | Brand mark + wordmark |
| `src/tweaks-panel.jsx` | In-app design tweaks panel |

---

## Free APIs Wired

All have CORS enabled — work directly from the browser, no backend needed.

| Provider | What | Cost | Setup |
|---|---|---|---|
| **Open-Meteo** | Wind, real-feel, dew point, precip | $0 — no key | Works immediately |
| **The Odds API** | DK · FD · Caesars lines | Free 500 req/mo | Paste key into `localStorage["eb.oddsApiKey"]` |
| **DataGolf** | Player rankings, field updates | Free signup | Paste key into `localStorage["eb.dataGolfKey"]` |
| **ESPN PGA** | Live scoreboard, player IDs | $0 — no key | Works immediately |

Fetchers live in `src/api.jsx`, exposed as `window.EB_API`.

---

## Deploy on GitHub Pages (Free)

1. Push these files to the repo root (you've already created `elliebets`)
2. **Settings → Pages**
3. Source: **Deploy from a branch** → Branch: `main`, folder: `/ (root)` → Save
4. Wait ~60 seconds
5. Live at `https://percycodesios.github.io/elliebets/`

Add to iPhone home screen so it feels like a real app.

---

## Roadmap

- **Live odds auto-sync** every 30s — wire The Odds API fetcher into the bet form
- **Auto-fetch closing line** at event start time
- **NFL wind-game model** (≥15mph from sideline historically drops totals 4–7 pts)
- **MLB park factors** + wind direction by ballpark
- **Backtest engine** — re-run any heuristic against historical events
- **Kelly criterion** stake sizing
- **Bet review queue** — weekly forced review of every settled bet
- **Real Firebase auth** + Firestore sync (replace mock login)
- **Stripe billing** for Pro / Edge tiers

---

## Pricing (Beta is free)

| Tier | Price | For |
|---|---|---|
| **Beta** | $0 | Invite-only, full features, manual entry |
| **Pro** | $79/mo or $66/mo annual | Live odds + weather + multi-sport + cloud sync |
| **Edge** | $299/mo or $208/mo annual | DataGolf SG, CLV tracking, custom heuristics, backtesting |

Founders' rates lock for life.

---

## Tech Stack

- **Frontend:** React 18 + Babel-in-browser (no build step)
- **Auth (planned):** Firebase Auth (Google), session-scoped
- **Database (planned):** Cloud Firestore — user-scoped paths
- **Hosting:** GitHub Pages (free)
- **APIs:** Open-Meteo, The Odds API, DataGolf, ESPN

---

## Responsible Gambling

EllieBets is a personal record-keeping and analytics tool for legal-age sports bettors. It does **not** facilitate, accept, or process wagers. Users are responsible for ensuring sports betting is legal in their jurisdiction.

**21+ only. If you or someone you know has a gambling problem, call 1-800-GAMBLER.**

---

Built solo. Stay sharp.
