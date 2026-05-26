// ─────────────────────────────────────────────────────────
// EllieBets — Free-tier API fetchers (drop-in, no proxy needed)
//
// All three providers below have permissive CORS, so these
// fetchers work directly from the browser without a backend.
//
// USAGE in the app: import this file, then call:
//   await EB_API.weather({ lat: 35.16, lon: -80.78 })
//   await EB_API.oddsGolfOutrights()
//   await EB_API.dgPlayerRanks()
// ─────────────────────────────────────────────────────────

// ── 1) Weather — Open-Meteo (FREE, NO KEY, NO LIMIT for personal use)
//    Docs: https://open-meteo.com/en/docs
//    Returns wind speed/gust/direction, apparent_temperature (real-feel),
//    dew_point_2m, relative_humidity_2m, precipitation_probability.
//    Replaces both Windfinder + Apple Weather in one call.
async function weather({ lat, lon }) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('current', [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'dew_point_2m',
    'precipitation_probability',
    'wind_speed_10m',
    'wind_gusts_10m',
    'wind_direction_10m',
  ].join(','));
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('wind_speed_unit', 'mph');
  url.searchParams.set('precipitation_unit', 'inch');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  const c = json.current || {};
  const dir = c.wind_direction_10m || 0;
  return {
    tempActual: Math.round(c.temperature_2m),
    realFeel: Math.round(c.apparent_temperature),
    dewPoint: Math.round(c.dew_point_2m),
    humidity: Math.round(c.relative_humidity_2m),
    windMph: Math.round(c.wind_speed_10m),
    windGust: Math.round(c.wind_gusts_10m),
    windDirDeg: Math.round(dir),
    windDir: degToCompass(dir),
    precipPct: Math.round(c.precipitation_probability ?? 0),
    source: { wind: 'Open-Meteo', temp: 'Open-Meteo' },
    updated: 'Just now',
  };
}

function degToCompass(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(((deg % 360) / 22.5)) % 16];
}

// ── 2) Live odds — The Odds API (FREE 500 REQ/MONTH)
//    Sign up: https://the-odds-api.com  →  free key, no credit card
//    Returns DraftKings, FanDuel, Caesars markets across most US sports.
//    LOCAL STORAGE: paste key into localStorage 'eb.oddsApiKey'
async function oddsGolfOutrights() {
  const key = localStorage.getItem('eb.oddsApiKey');
  if (!key) throw new Error('Set localStorage["eb.oddsApiKey"] — get a free one at the-odds-api.com');
  const url = `https://api.the-odds-api.com/v4/sports/golf_pga_championship_winner/odds/?regions=us&markets=outrights&bookmakers=draftkings,fanduel,williamhill_us&oddsFormat=american&apiKey=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Odds API ${res.status}`);
  return res.json();
}

// Generic sports list — call once to see what's in season
async function oddsSports() {
  const key = localStorage.getItem('eb.oddsApiKey');
  if (!key) throw new Error('Set localStorage["eb.oddsApiKey"]');
  const res = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${key}`);
  return res.json();
}

// ── 3) DataGolf — FREE tier (rankings + field, NO SG without paid plan)
//    Sign up: https://datagolf.com  →  Settings → API → free key
//    LOCAL STORAGE: paste key into localStorage 'eb.dataGolfKey'
async function dgPlayerRanks() {
  const key = localStorage.getItem('eb.dataGolfKey');
  if (!key) throw new Error('Set localStorage["eb.dataGolfKey"] — sign up free at datagolf.com');
  const res = await fetch(`https://feeds.datagolf.com/preds/get-dg-rankings?file_format=json&key=${key}`);
  if (!res.ok) throw new Error(`DataGolf ${res.status}`);
  return res.json();
}

async function dgFieldUpdates() {
  const key = localStorage.getItem('eb.dataGolfKey');
  if (!key) throw new Error('Set localStorage["eb.dataGolfKey"]');
  const res = await fetch(`https://feeds.datagolf.com/field-updates?file_format=json&key=${key}`);
  return res.json();
}

// ── 4) ESPN PGA — NO KEY, undocumented but stable public JSON.
//    Use case: live scoreboard, current tournament name, player IDs.
async function espnPgaScoreboard() {
  const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard');
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  return res.json();
}

// ── 5) Helper: get closing odds for a market right before tee-off.
//    Real implementation: schedule a fetch at event_time - 5min, save to bet.closingOdds.
async function fetchClosingLine(/* eventId, market, playerName */) {
  // Stub: caller wires this to oddsGolfOutrights() once setup.
  return null;
}

window.EB_API = {
  weather,
  oddsGolfOutrights,
  oddsSports,
  dgPlayerRanks,
  dgFieldUpdates,
  espnPgaScoreboard,
  fetchClosingLine,
};
