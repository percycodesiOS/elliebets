// Mock data: sports, events, players, current-day weather snapshots.
// Real app: replace with API fetchers (Odds API, Windfinder, Apple Weather, etc.)

const SPORTS = [
  { id: 'golf', name: 'Golf',  icon: '⛳', color: '#7dffb5', primary: true },
  { id: 'nfl',  name: 'NFL',   icon: '🏈', color: '#fbbf24' },
  { id: 'nba',  name: 'NBA',   icon: '🏀', color: '#fb923c' },
  { id: 'mlb',  name: 'MLB',   icon: '⚾', color: '#60a5fa' },
  { id: 'nhl',  name: 'NHL',   icon: '🏒', color: '#a78bfa' },
  { id: 'soccer', name: 'Soccer', icon: '⚽', color: '#34d399' },
];

const SPORTSBOOKS = [
  { id: 'dk',  name: 'DraftKings', short: 'DK',  color: '#53d337' },
  { id: 'fd',  name: 'FanDuel',    short: 'FD',  color: '#1493ff' },
  { id: 'czr', name: 'Caesars',    short: 'CZR', color: '#c79b3a' },
];

// Live tournament example — first round, hot/humid morning
const GOLF_EVENTS = [
  {
    id: 'pga-quail-r1',
    name: 'PGA Championship — Round 1',
    course: 'Quail Hollow Club',
    city: 'Charlotte, NC',
    tee: 'Thu 7:10 AM ET',
    isLive: true,
    coords: { lat: 35.1632, lon: -80.7795 },
    weather: {
      tempActual: 82,
      realFeel: 91,
      dewPoint: 73,
      humidity: 84,
      windMph: 12,
      windGust: 19,
      windDir: 'WSW',
      windDirDeg: 250,
      precipPct: 30,
      source: { wind: 'Windfinder', temp: 'Apple Weather' },
      updated: 'Updated 6 min ago',
    },
  },
  {
    id: 'memorial-r1',
    name: 'The Memorial — Round 1',
    course: 'Muirfield Village',
    city: 'Dublin, OH',
    tee: 'Thu 8:00 AM ET',
    isLive: false,
    coords: { lat: 40.1525, lon: -83.1310 },
    weather: {
      tempActual: 71, realFeel: 73, dewPoint: 58, humidity: 62,
      windMph: 8, windGust: 14, windDir: 'NW', windDirDeg: 315,
      precipPct: 5, source: { wind: 'Windfinder', temp: 'Apple Weather' },
      updated: 'Updated 11 min ago',
    },
  },
];

const GOLF_PLAYERS = [
  { name: 'Scottie Scheffler', country: 'USA', odds: { winner: '+450' } },
  { name: 'Rory McIlroy',      country: 'NIR', odds: { winner: '+1100' } },
  { name: 'Xander Schauffele', country: 'USA', odds: { winner: '+1400' } },
  { name: 'Collin Morikawa',   country: 'USA', odds: { winner: '+1800' } },
  { name: 'Ludvig Åberg',      country: 'SWE', odds: { winner: '+2000' } },
  { name: 'Viktor Hovland',    country: 'NOR', odds: { winner: '+2200' } },
  { name: 'Jon Rahm',          country: 'ESP', odds: { winner: '+1600' } },
  { name: 'Patrick Cantlay',   country: 'USA', odds: { winner: '+3000' } },
  { name: 'Tommy Fleetwood',   country: 'ENG', odds: { winner: '+2800' } },
  { name: 'Tony Finau',        country: 'USA', odds: { winner: '+3500' } },
  { name: 'Justin Thomas',     country: 'USA', odds: { winner: '+2500' } },
  { name: 'Sahith Theegala',   country: 'USA', odds: { winner: '+5000' } },
  { name: 'Wyndham Clark',     country: 'USA', odds: { winner: '+4000' } },
  { name: 'Hideki Matsuyama',  country: 'JPN', odds: { winner: '+3300' } },
  { name: 'Jordan Spieth',     country: 'USA', odds: { winner: '+5500' } },
  { name: 'Brooks Koepka',     country: 'USA', odds: { winner: '+4500' } },
  { name: 'Bryson DeChambeau', country: 'USA', odds: { winner: '+1500' } },
  { name: 'Akshay Bhatia',     country: 'USA', odds: { winner: '+8000' } },
];

const GOLF_MARKETS = [
  'Round Score O/U',
  'Tournament Top 5',
  'Tournament Top 10',
  'Tournament Top 20',
  'Make the Cut',
  'Outright Winner',
  'First-Round Leader',
  '3-Ball (Round)',
  'Birdies O/U',
  'Bogeys O/U',
];

// Sample seed bets — gives the dashboard life on first load
const SEED_BETS = [
  {
    id: 'b1', sport: 'golf', book: 'dk', event: 'PGA Championship — Round 1',
    pick: 'Scottie Scheffler', market: 'Round Score O/U',
    line: 69.5, side: 'Under', odds: -115, stake: 50,
    notes: 'Dew 73° + real-feel 91° vs 82° actual → suppressed-scoring signal. Wind 12mph WSW manageable.',
    placedAt: 'Today, 6:42 AM', status: 'live',
  },
  {
    id: 'b2', sport: 'golf', book: 'fd', event: 'PGA Championship — Outright',
    pick: 'Ludvig Åberg', market: 'Top 10 Finish',
    line: null, side: 'Yes', odds: +180, stake: 25,
    notes: 'Ball-strikers favored in heavy air. SG:Tee strongest in field.',
    placedAt: 'Yesterday, 9:18 PM', status: 'pending',
  },
  {
    id: 'b3', sport: 'golf', book: 'czr', event: 'PGA Championship — R1',
    pick: 'Bryson DeChambeau', market: 'First-Round Leader',
    line: null, side: 'Yes', odds: +2500, stake: 10,
    notes: 'Lottery — high upside in soft greens.',
    placedAt: 'Yesterday, 9:22 PM', status: 'pending',
  },
  {
    id: 'b4', sport: 'golf', book: 'dk', event: 'The Memorial — R1',
    pick: 'Collin Morikawa', market: 'Round Score O/U',
    line: 70.5, side: 'Under', odds: -110, stake: 40, closingOdds: -125,
    notes: 'Cool morning, low wind — but Muirfield rewards iron play.',
    placedAt: '2 days ago', status: 'won', payout: 76.36,
  },
  {
    id: 'b5', sport: 'golf', book: 'fd', event: 'The Memorial — Top 20',
    pick: 'Sahith Theegala', market: 'Top 20 Finish',
    line: null, side: 'Yes', odds: +140, stake: 20, closingOdds: +120,
    notes: '',
    placedAt: '3 days ago', status: 'lost',
  },
  {
    id: 'b6', sport: 'golf', book: 'dk', event: 'Wells Fargo — R3',
    pick: 'Xander Schauffele', market: 'Round Score O/U',
    line: 68.5, side: 'Under', odds: -120, stake: 60, closingOdds: -130,
    notes: 'Cold front cleared — perfect scoring conditions.',
    placedAt: '5 days ago', status: 'won', payout: 110,
  },
  {
    id: 'b7', sport: 'golf', book: 'czr', event: 'Wells Fargo — Top 5',
    pick: 'Rory McIlroy', market: 'Top 5 Finish',
    line: null, side: 'Yes', odds: +220, stake: 30, closingOdds: +180,
    notes: '',
    placedAt: '6 days ago', status: 'won', payout: 96,
  },
  {
    id: 'b8', sport: 'golf', book: 'dk', event: 'Truist — Make Cut',
    pick: 'Tony Finau', market: 'Make the Cut',
    line: null, side: 'No', odds: +210, stake: 25, closingOdds: +250,
    notes: '',
    placedAt: '8 days ago', status: 'lost',
  },
  {
    id: 'b9', sport: 'golf', book: 'fd', event: 'Truist — R2',
    pick: 'Justin Thomas', market: 'Bogeys O/U',
    line: 3.5, side: 'Over', odds: -130, stake: 35, closingOdds: -120,
    notes: '',
    placedAt: '9 days ago', status: 'won', payout: 61.92,
  },
  {
    id: 'b10', sport: 'golf', book: 'dk', event: 'CJ Cup — R4',
    pick: 'Tommy Fleetwood', market: 'Top 10 Finish',
    line: null, side: 'Yes', odds: +160, stake: 30, closingOdds: +200,
    notes: '',
    placedAt: '12 days ago', status: 'lost',
  },
];

// American odds helpers
function americanToDecimal(o) {
  const n = Number(o);
  if (isNaN(n) || n === 0) return 1;
  return n > 0 ? 1 + n / 100 : 1 + 100 / Math.abs(n);
}
function impliedProb(o) {
  const n = Number(o);
  if (!n || isNaN(n)) return 0;
  return n > 0 ? 100 / (n + 100) : Math.abs(n) / (Math.abs(n) + 100);
}
// CLV = decimal-odds edge vs. closing line. Positive = you beat the close.
// (placement_decimal - closing_decimal) / closing_decimal × 100, expressed in %
function clvPct(placedOdds, closingOdds) {
  if (placedOdds == null || closingOdds == null || closingOdds === '' || placedOdds === '') return null;
  const dp = americanToDecimal(placedOdds);
  const dc = americanToDecimal(closingOdds);
  if (!dc || dc === 1) return null;
  return ((dp - dc) / dc) * 100;
}
function toWin(stake, odds) {
  const s = Number(stake) || 0;
  const o = Number(odds) || 0;
  if (!s || !o) return 0;
  return o > 0 ? s * (o / 100) : s * (100 / Math.abs(o));
}
function formatOdds(o) {
  const n = Number(o);
  if (!n || isNaN(n)) return '';
  return n > 0 ? `+${n}` : `${n}`;
}
function fmtMoney(n, opts = {}) {
  const v = Number(n) || 0;
  const sign = opts.showSign && v > 0 ? '+' : v < 0 ? '−' : '';
  const abs = Math.abs(v);
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: opts.decimals ?? 2, maximumFractionDigits: opts.decimals ?? 2 });
  return `${sign}$${str}`;
}

Object.assign(window, {
  SPORTS, SPORTSBOOKS, GOLF_EVENTS, GOLF_PLAYERS, GOLF_MARKETS, SEED_BETS,
  americanToDecimal, impliedProb, clvPct, toWin, formatOdds, fmtMoney,
});
