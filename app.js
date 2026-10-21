(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const PENDING_KEY = 'svamp-pending-login';
  const THEME_KEY = 'svamp-theme';
  const RESEND_SECONDS = 60;

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
    $('form-email').hidden = true;
    setMsg(!window.supabase
      ? 'Kunde inte ladda Supabase. Kontrollera nätet och försök igen.'
      : 'Fyll i Supabase-uppgifterna i config.js.', 'error');
    return;
  }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  window.sb = sb; // för felsökning i konsolen och kommande steg

  // ---------- Inloggning med kod ----------
  let resendTimer = null;

  function getPending() {
    try { return JSON.parse(store.get(PENDING_KEY) || 'null'); } catch (e) { return null; }
  }

  function showEmailStep() {
    store.del(PENDING_KEY);
    $('form-code').hidden = true;
    $('form-email').hidden = false;
    setMsg('');
    $('email').focus();
  }

  function showCodeStep(email, sentAt) {
    $('sent-to').textContent = email;
    $('form-email').hidden = true;
    $('form-code').hidden = false;
    $('code').value = '';
    startResendCountdown(sentAt);
  }

  function startResendCountdown(sentAt) {
    const btn = $('btn-resend');
    clearInterval(resendTimer);
    const tick = () => {
      const left = Math.ceil(RESEND_SECONDS - (Date.now() - sentAt) / 1000);
      if (left > 0) {
        btn.disabled = true;
        btn.textContent = 'Ny kod om ' + left + ' s';
      } else {
        btn.disabled = false;
        btn.textContent = 'Skicka ny kod';
        clearInterval(resendTimer);
      }
    };
    tick();
    resendTimer = setInterval(tick, 1000);
  }

  function friendlyError(err) {
    const m = (err && err.message || '').toLowerCase();
    if (err && err.status === 429 || m.includes('rate limit') || m.includes('security purposes')) {
      return 'För många försök. Vänta en stund och prova igen.';
    }
    if (m.includes('expired') || m.includes('invalid') || m.includes('token')) {
      return 'Fel eller utgången kod. Kontrollera koden eller begär en ny.';
    }
    if (m.includes('signups not allowed') || m.includes('not allowed')) {
      return 'Den här e-postadressen har inte tillgång till appen.';
    }
    if (m.includes('fetch') || m.includes('network')) {
      return 'Ingen kontakt med servern. Kontrollera nätet.';
    }
    return 'Något gick fel: ' + (err && err.message || 'okänt fel');
  }

  async function sendCode(email) {
    setMsg('Skickar kod…');
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) { setMsg(friendlyError(error), 'error'); return false; }
    const sentAt = Date.now();
    // Spara så att kodsteget finns kvar om iPhone stänger appen medan du läser mejlet.
    store.set(PENDING_KEY, JSON.stringify({ email, sentAt }));
    showCodeStep(email, sentAt);
    setMsg('Kolla din e-post.', 'ok');
    $('code').focus();
    return true;
  }

  $('form-email').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Ange en giltig e-postadress.', 'error');
      return;
    }
    const btn = e.submitter || $('form-email').querySelector('button');
    btn.disabled = true;
    await sendCode(email);
    btn.disabled = false;
  });

  $('form-code').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pending = getPending();
    const token = $('code').value.replace(/\D/g, '');
    if (!pending) { showEmailStep(); return; }
    if (token.length < 6) { setMsg('Koden är minst 6 siffror.', 'error'); return; }

    const btn = e.submitter || $('form-code').querySelector('button[type="submit"]');
    btn.disabled = true;
    setMsg('Loggar in…');
    const { error } = await sb.auth.verifyOtp({ email: pending.email, token, type: 'email' });
    btn.disabled = false;
    if (error) { setMsg(friendlyError(error), 'error'); return; }
    store.del(PENDING_KEY);
    setMsg('');
  });

  // Skicka automatiskt när hela koden är inklistrad/autofylld
  $('code').addEventListener('input', (e) => {
    const v = e.target.value.replace(/\D/g, '');
    e.target.value = v;
    if (v.length === 6) $('form-code').requestSubmit();
  });

  $('btn-resend').addEventListener('click', async () => {
    const pending = getPending();
    if (pending) await sendCode(pending.email);
  });

  $('btn-change-email').addEventListener('click', showEmailStep);

  $('btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
  });

  // ---------- Sessionsstyrning ----------
  function render(session) {
    if (session && session.user) {
      $('user-email').textContent = session.user.email || '';
      show('app');
      return;
    }
    show('login');
    const pending = getPending();
    if (pending && Date.now() - pending.sentAt < 60 * 60 * 1000) {
      $('email').value = pending.email;
      showCodeStep(pending.email, pending.sentAt);
    } else {
      store.del(PENDING_KEY);
      $('form-code').hidden = true;
      $('form-email').hidden = false;
    }
  }

  sb.auth.onAuthStateChange((_event, session) => render(session));
  sb.auth.getSession().then(({ data }) => render(data.session));

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
