(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const THEME_KEY = 'svamp-theme';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  // ---------- Tema ----------
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_LABELS = { auto: 'Auto', light: 'Ljust', dark: 'Mörkt' };
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    const t = store.get(THEME_KEY);
    return THEMES.includes(t) ? t : 'auto';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    $('theme-label').textContent = THEME_LABELS[theme];
    const dark = theme === 'dark' || (theme === 'auto' && darkQuery.matches);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#1E1912' : '#FBF4E6');
  }

  $('btn-theme').addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
    if (next === 'auto') store.del(THEME_KEY); else store.set(THEME_KEY, next);
    applyTheme(next);
  });
  darkQuery.addEventListener('change', () => applyTheme(currentTheme()));
  applyTheme(currentTheme());

  // ---------- Vyer ----------
  function show(view) {
    ['loading', 'login', 'app'].forEach((v) => { $('view-' + v).hidden = v !== view; });
  }

  function setMsg(text, kind) {
    const el = $('login-msg');
    el.textContent = text || '';
    el.className = 'msg' + (kind ? ' ' + kind : '');
  }

  // ---------- Supabase ----------
  const cfg = window.SVAMP_CONFIG || {};
  const configured = cfg.supabaseUrl && !cfg.supabaseUrl.includes('DITT-PROJEKT') &&
                     cfg.supabaseAnonKey && !cfg.supabaseAnonKey.includes('DIN-');

  if (!window.supabase || !configured) {
    show('login');
    $('form-login').hidden = true;
    setMsg(!window.supabase
      ? 'Kunde inte ladda Supabase. Kontrollera nätet och försök igen.'
      : 'Fyll i Supabase-uppgifterna i config.js.', 'error');
    return;
  }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  window.sb = sb; // för felsökning i konsolen och kommande steg

  // ---------- Inloggning med lösenord (samma konto som Jaktvind) ----------
  function friendlyError(err) {
    const m = (err && err.message || '').toLowerCase();
    if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Fel e-post eller lösenord.';
    if (m.includes('email not confirmed')) return 'E-postadressen är inte bekräftad.';
    if ((err && err.status === 429) || m.includes('rate limit')) return 'För många försök. Vänta en stund och prova igen.';
    if (m.includes('fetch') || m.includes('network')) return 'Ingen kontakt med servern. Kontrollera nätet.';
    return 'Något gick fel: ' + (err && err.message || 'okänt fel');
  }

  $('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const password = $('password').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMsg('Ange en giltig e-postadress.', 'error'); return; }
    if (!password) { setMsg('Ange ditt lösenord.', 'error'); return; }

    const btn = $('form-login').querySelector('button[type="submit"]');
    btn.disabled = true;
    setMsg('Loggar in…');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false;
    if (error) { setMsg(friendlyError(error), 'error'); return; }
    $('password').value = '';
    setMsg('');
  });

  $('btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
  });

  // ---------- Sessionsstyrning ----------
  let currentUserId = null;
  let fyndReady = false;

  function render(session) {
    if (session && session.user) {
      $('user-email').textContent = session.user.email || '';
      show('app');
      window.SvampMap.init((point) => window.SvampFynd.open(point));
      if (!fyndReady) { window.SvampFynd.setup(sb, () => loadFynd(true)); fyndReady = true; }
      window.SvampFynd.setUser(session.user.id);
      if (currentUserId !== session.user.id) {
        currentUserId = session.user.id;
        loadFynd().then(trySync);
      }
    } else {
      currentUserId = null;
      show('login');
    }
  }

  const CACHE_KEY = 'svamp-fynd-cache';

  // Hämtar fynd från servern (eller senaste sparade listan offline) och lägger till köade fynd
  async function loadFynd(quiet) {
    let server = null;
    let error = null;
    try {
      const res = await sb.from('svamp_fynd')
        .select('id, art, mangd, anteckning, lat, lon, funnen_at, foto_path, vader')
        .order('funnen_at', { ascending: false });
      server = res.data;
      error = res.error;
    } catch (e) { error = e; }

    let offline = false;
    if (error) {
      offline = window.SvampKo.isNetworkError(error);
      if (!offline) {
        const saknas = (error.code === '42P01') || /does not exist|not find/i.test(error.message || '');
        window.SvampMap.toast(saknas ? 'Tabellen svamp_fynd saknas – kör supabase/schema.sql.' : 'Kunde inte hämta fynd: ' + error.message, 'error', 6000);
      }
      try { server = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); } catch (e) { server = []; }
    } else {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(server || [])); } catch (e) {}
    }

    const ko = currentUserId ? await window.SvampKo.forUser(currentUserId).catch(() => []) : [];
    const koIds = new Set(ko.map((i) => i.id));
    const pending = ko.map((i) => Object.assign({}, i.row, { _pending: true, _harFoto: !!i.blob }));
    const list = pending.concat((server || []).filter((f) => !koIds.has(f.id)));

    window.SvampMap.showFynd(list);
    updateBadge(ko.length);
    if (!error) window.SvampFynd.backfill(server);
    if (!quiet) {
      if (offline) window.SvampMap.toast('Ingen täckning – visar sparade fynd', 'ok', 3000);
      else if (!error) {
        const mb = await fotoMb();
        const lagring = mb != null ? ' · foton ' + mb.toFixed(1).replace('.', ',') + ' MB av 1 024' : '';
        window.SvampMap.toast(list.length ? list.length + ' fynd på kartan' + lagring : 'Databasen är klar · inga fynd än', 'ok', 3000);
      }
    }
  }

  // Summerar storleken på dina foton i bucketen
  async function fotoMb() {
    if (!currentUserId) return null;
    try {
      const { data, error } = await sb.storage.from('svamp-foton').list(currentUserId, { limit: 1000 });
      if (error || !data) return null;
      return data.reduce((sum, f) => sum + ((f.metadata && f.metadata.size) || 0), 0) / (1024 * 1024);
    } catch (e) { return null; }
  }

  function updateBadge(n) {
    const el = $('queue-badge');
    el.hidden = !n;
    el.textContent = n + ' väntar';
  }

  // Ladda upp kön när det finns täckning
  let syncTimer = null;
  async function trySync() {
    if (!currentUserId || !navigator.onLine) return;
    const ko = await window.SvampKo.forUser(currentUserId).catch(() => []);
    if (!ko.length) return;
    const res = await window.SvampFynd.sync();
    if (res && res.sent) window.SvampMap.toast(res.sent + (res.sent === 1 ? ' fynd uppladdat' : ' fynd uppladdade'), 'ok', 2500);
  }
  window.addEventListener('online', trySync);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') trySync(); });
  syncTimer = setInterval(trySync, 60000);
  $('queue-badge').addEventListener('click', async () => {
    if (!navigator.onLine) { window.SvampMap.toast('Ingen täckning just nu – försöker igen automatiskt.', 'ok', 3000); return; }
    await trySync();
  });

  sb.auth.onAuthStateChange((_event, session) => render(session));
  sb.auth.getSession().then(({ data }) => render(data.session));

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    // Ladda om en gång när en ny version av appen tagit över
    let reloaded = false;
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded) { reloaded = true; location.reload(); }
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => reg.update()).catch(() => {});
    });
  }
})();
