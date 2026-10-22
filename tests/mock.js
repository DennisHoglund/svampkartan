// Mockar allt externt så att testerna är snabba, stabila och aldrig rör riktig data:
// Supabase (auth, databas, foton), CDN-bibliotek, kartrutor och Open-Meteo.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SUPABASE = 'https://sjdznlmnvubqscftdkoj.supabase.co';
const STORAGE_KEY = 'sb-sjdznlmnvubqscftdkoj-auth-token';
const TILE = fs.readFileSync(path.join(__dirname, 'data', 'tile.png'));
const FOTO = fs.readFileSync(path.join(__dirname, 'data', 'kantarell.jpg'));

const ANVANDARE = {
  id: '11111111-2222-3333-4444-555555555555',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@svampkartan.se',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z'
};
const LOSENORD = 'kantarell123';

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function session() {
  const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
  const token = b64url({ alg: 'HS256', typ: 'JWT' }) + '.' +
    b64url({ sub: ANVANDARE.id, email: ANVANDARE.email, role: 'authenticated', aud: 'authenticated', exp }) + '.signatur';
  return { access_token: token, token_type: 'bearer', expires_in: 3600 * 24, expires_at: exp, refresh_token: 'refresh', user: ANVANDARE };
}

// Exempelfynd runt Gräsö/Roslagen
function exempelFynd() {
  return [
    { id: 'f1', user_id: ANVANDARE.id, art: 'kantarell', mangd: 4, anteckning: 'Vid mossiga stenen under granarna', lat: 60.3920, lon: 18.4300, funnen_at: '2026-08-24T09:30:00Z', foto_path: ANVANDARE.id + '/f1.jpg', vader: { regn_10d: 21.4, temp_snitt: 14.2 } },
    { id: 'f2', user_id: ANVANDARE.id, art: 'karljohan', mangd: 2, anteckning: null, lat: 60.3935, lon: 18.4345, funnen_at: '2026-09-02T15:00:00Z', foto_path: null, vader: { regn_10d: 12.0, temp_snitt: 12.8 } },
    { id: 'f3', user_id: ANVANDARE.id, art: 'trattkantarell', mangd: 5, anteckning: 'Massor i blåbärsriset', lat: 60.3905, lon: 18.4365, funnen_at: '2026-10-05T11:00:00Z', foto_path: null, vader: { regn_10d: 30.2, temp_snitt: 8.1 } }
  ];
}

const OPEN_METEO = {
  daily: {
    time: [], precipitation_sum: [0, 2.5, 4.1, 0, 0, 1.2, 6.3, 0.4, 0, 2.0],
    temperature_2m_max: [15, 14, 13, 12, 14, 15, 12, 11, 10, 12],
    temperature_2m_min: [7, 6, 5, 4, 6, 7, 5, 3, 2, 4]
  }
};

const CDN = [
  [/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js', 'application/javascript'],
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/[\d.]+\/leaflet(\.min)?\.js/, 'node_modules/leaflet/dist/leaflet.js', 'application/javascript'],
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/[\d.]+\/leaflet(\.min)?\.css/, 'node_modules/leaflet/dist/leaflet.css', 'text/css']
];

const TILE_HOSTS = /opentopomap\.org|tile\.openstreetmap\.org|tile-cyclosm|arcgisonline\.com|waymarkedtrails\.org/;

// Installerar alla mockar på sidan. Returnerar ett "api" med databasens tillstånd och loggade anrop.
async function mocka(page, { fynd = exempelFynd() } = {}) {
  const api = { fynd: fynd.map((f) => ({ ...f })), uppladdade: [], borttagnaFoton: [], anrop: [], nere: false };

  await page.route(/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/, (route) => {
    const url = route.request().url();
    const img = url.match(/leaflet\/[\d.]+\/images\/(.+\.png)/);
    if (img) return route.fulfill({ path: path.join(ROOT, 'node_modules/leaflet/dist/images', img[1]), contentType: 'image/png' });
    const hit = CDN.find(([re]) => re.test(url));
    if (!hit) return route.abort();
    return route.fulfill({ path: path.join(ROOT, hit[1]), contentType: hit[2] });
  });

  await page.route(TILE_HOSTS, (route) => route.fulfill({ body: TILE, contentType: 'image/png' }));
  await page.route(/open-meteo\.com/, (route) => route.fulfill({ json: OPEN_METEO }));

  await page.route(SUPABASE + '/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname;
    const m = req.method();
    api.anrop.push({ metod: m, sokvag: p + url.search });

    if (api.nere) return route.abort('internetdisconnected');
    if (m === 'OPTIONS') return route.fulfill({ status: 200, headers: cors() });

    // ---- Auth ----
    if (p === '/auth/v1/token') {
      const body = req.postDataJSON() || {};
      if (body.email === ANVANDARE.email && body.password === LOSENORD) return json(route, 200, session());
      return json(route, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
    }
    if (p === '/auth/v1/user') return json(route, 200, ANVANDARE);
    if (p === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors() });

    // ---- Databas ----
    if (p === '/rest/v1/svamp_fynd') {
      const idEq = (url.searchParams.get('id') || '').replace(/^eq\./, '');
      if (m === 'GET' || m === 'HEAD') {
        const rows = [...api.fynd].sort((a, b) => b.funnen_at.localeCompare(a.funnen_at));
        return json(route, 200, m === 'HEAD' ? '' : rows, { 'content-range': '0-' + (rows.length - 1) + '/' + rows.length });
      }
      if (m === 'POST') {
        const rows = [].concat(req.postDataJSON());
        rows.forEach((r) => {
          const i = api.fynd.findIndex((f) => f.id === r.id);
          if (i >= 0) api.fynd[i] = { ...api.fynd[i], ...r }; else api.fynd.push({ user_id: ANVANDARE.id, ...r });
        });
        return route.fulfill({ status: 201, headers: cors() });
      }
      if (m === 'PATCH') {
        const f = api.fynd.find((x) => x.id === idEq);
        if (f) Object.assign(f, req.postDataJSON());
        return route.fulfill({ status: 204, headers: cors() });
      }
      if (m === 'DELETE') {
        api.fynd = api.fynd.filter((x) => x.id !== idEq);
        return route.fulfill({ status: 204, headers: cors() });
      }
    }

    // ---- Foton ----
    if (p.startsWith('/storage/v1/object/list/')) return json(route, 200, api.uppladdade.map((u) => ({ name: u.split('/').pop(), metadata: { size: 180000 } })));
    if (p.startsWith('/storage/v1/object/sign/') && m === 'POST') {
      const fil = p.replace('/storage/v1/object/sign/', '');
      return json(route, 200, { signedURL: '/object/sign/' + fil + '?token=test' });
    }
    if (p.startsWith('/storage/v1/object/svamp-foton/') && (m === 'POST' || m === 'PUT')) {
      const fil = p.replace('/storage/v1/object/svamp-foton/', '');
      api.uppladdade.push(decodeURIComponent(fil));
      return json(route, 200, { Key: 'svamp-foton/' + fil });
    }
    if (p === '/storage/v1/object/svamp-foton' && m === 'DELETE') {
      api.borttagnaFoton.push(...((req.postDataJSON() || {}).prefixes || []));
      return json(route, 200, []);
    }
    if (p.startsWith('/storage/v1/object/sign/') || p.startsWith('/storage/v1/object/')) {
      return route.fulfill({ body: FOTO, contentType: 'image/jpeg', headers: cors() });
    }

    return json(route, 404, { message: 'Ej mockat: ' + m + ' ' + p });
  });

  return api;
}

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS',
    'access-control-expose-headers': 'content-range'
  };
}

function json(route, status, body, extra) {
  return route.fulfill({ status, headers: { ...cors(), ...(extra || {}) }, contentType: 'application/json', body: typeof body === 'string' ? body : JSON.stringify(body) });
}

// Lägger in en inloggad session innan sidan laddas (snabbare än att logga in via formuläret)
async function inloggad(page) {
  const s = session();
  await page.addInitScript(([key, val]) => {
    try { localStorage.setItem(key, val); } catch (e) {}
  }, [STORAGE_KEY, JSON.stringify(s)]);
}

module.exports = { mocka, inloggad, ANVANDARE, LOSENORD, exempelFynd };
