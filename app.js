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
  function render(session) {
    if (session && session.user) {
      currentUserId = session.user.id;
      $('user-email').textContent = session.user.email || '';
      show('app');
      checkDb();
    } else {
      show('login');
    }
  }

  async function checkDb() {
    const el = $('db-status');
    const fynd = await sb.from('svamp_fynd').select('id', { count: 'exact', head: true });
    const foton = await sb.storage.from('svamp-foton').list(sb_uid(), { limit: 1 });
    if (fynd.error) {
      el.textContent = 'Tabellen svamp_fynd saknas – kör supabase/schema.sql.';
      el.className = 'msg error';
    } else if (foton.error) {
      el.textContent = 'Fotobucketen svamp-foton saknas – kör supabase/schema.sql.';
      el.className = 'msg error';
    } else {
      el.textContent = 'Databasen är klar · ' + (fynd.count || 0) + ' fynd sparade';
      el.className = 'msg ok';
    }
  }

  let currentUserId = null;
  function sb_uid() { return currentUserId || ''; }

  sb.auth.onAuthStateChange((_event, session) => render(session));
  sb.auth.getSession().then(({ data }) => render(data.session));

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
