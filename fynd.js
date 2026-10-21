// Nytt fynd: formulär, foto, spara, visa och ta bort.
window.SvampFynd = (function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const LAST_ART_KEY = 'svamp-last-art';
  const BUCKET = 'svamp-foton';
  const MAX_SIDE = 1600;
  const MANGD = [
    { v: 1, t: 'Enstaka' }, { v: 2, t: 'Lite' }, { v: 3, t: 'Lagom' },
    { v: 4, t: 'Mycket' }, { v: 5, t: 'Massor' }
  ];

  let sb = null;
  let userId = null;
  let onSaved = null;
  let state = null;
  const urlCache = new Map();

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  function setup(client, savedCb) {
    sb = client;
    onSaved = savedCb;

    // Arter
    const grid = $('art-grid');
    window.SVAMP_ARTER.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.art = a.id;
      b.innerHTML = '<span class="dot" style="background:' + a.farg + '"></span>' + a.namn;
      b.addEventListener('click', () => selectArt(a.id));
      grid.appendChild(b);
    });

    // Mängd
    const seg = $('mangd');
    MANGD.forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.v = m.v;
      b.innerHTML = '<strong>' + m.v + '</strong><small>' + m.t + '</small>';
      b.addEventListener('click', () => selectMangd(m.v));
      seg.appendChild(b);
    });

    $('btn-sheet-close').addEventListener('click', close);
    $('sheet-backdrop').addEventListener('click', close);
    $('btn-place').addEventListener('click', placeOnMap);
    $('fynd-foto').addEventListener('change', onPhoto);
    $('form-fynd').addEventListener('submit', save);

    // Foto i popup + ta bort
    window.SvampMap.onPopupOpen(loadPopupPhoto);
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.pop-delete');
      if (btn) remove(btn.closest('.pop'));
    });
  }

  function setUser(id) { userId = id; }

  // ---------- Formulär ----------
  function open(point) {
    state = {
      id: (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)),
      art: store.get(LAST_ART_KEY) || 'kantarell',
      mangd: 3,
      point,
      blob: null
    };
    selectArt(state.art);
    selectMangd(state.mangd);
    updatePlaceText();
    $('fynd-tid').value = localInputValue(new Date());
    $('fynd-not').value = '';
    $('fynd-foto').value = '';
    $('foto-preview').hidden = true;
    $('foto-text').textContent = 'Ta eller välj foto';
    setMsg('');
    $('sheet').hidden = false;
  }

  function close() {
    $('sheet').hidden = true;
    const img = $('foto-preview');
    if (img.src) URL.revokeObjectURL(img.src);
    state = null;
  }

  function selectArt(id) {
    if (state) state.art = id;
    document.querySelectorAll('#art-grid .chip').forEach((c) => c.classList.toggle('on', c.dataset.art === id));
  }

  function selectMangd(v) {
    if (state) state.mangd = v;
    document.querySelectorAll('#mangd button').forEach((b) => b.classList.toggle('on', Number(b.dataset.v) === v));
  }

  function updatePlaceText() {
    const p = state.point;
    $('place-text').textContent = p.placerad
      ? 'Placerad på kartan'
      : 'Din position' + (p.noggrannhet ? ' (±' + Math.round(p.noggrannhet) + ' m)' : '');
  }

  async function placeOnMap() {
    $('sheet').hidden = true;
    const p = await window.SvampMap.pickPoint(state.point);
    if (p && state) { state.point = p; updatePlaceText(); }
    $('sheet').hidden = false;
  }

  function localInputValue(d) {
    const z = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes());
  }

  function setMsg(text, kind) {
    const el = $('fynd-msg');
    el.textContent = text || '';
    el.className = 'msg' + (kind ? ' ' + kind : '');
  }

  // ---------- Foto ----------
  async function onPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !state) return;
    $('foto-text').textContent = 'Förbereder foto…';
    try {
      state.blob = await shrink(file);
      const img = $('foto-preview');
      if (img.src) URL.revokeObjectURL(img.src);
      img.src = URL.createObjectURL(state.blob);
      img.hidden = false;
      $('foto-text').textContent = 'Byt foto';
    } catch (err) {
      // Reserv: ladda upp originalet om nedskalningen inte fungerar i webbläsaren
      state.blob = file;
      $('foto-text').textContent = 'Foto valt (' + Math.round(file.size / 1024) + ' kB)';
    }
  }

  // Skala ner till max 1600 px och spara som JPEG (ca 200–400 kB)
  async function shrink(file) {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', 0.8));
  }

  // ---------- Spara ----------
  async function save(e) {
    e.preventDefault();
    if (!state || !userId) return;
    const btn = $('btn-save');
    btn.disabled = true;

    try {
      let foto_path = null;
      if (!state.blob && $('fynd-foto').files && $('fynd-foto').files.length) {
        throw new Error('Fotot hann inte förberedas – vänta en sekund och tryck Spara igen.');
      }
      if (state.blob) {
        setMsg('Laddar upp foto…');
        const typ = state.blob.type || 'image/jpeg';
        const ext = typ === 'image/png' ? 'png' : typ === 'image/heic' ? 'heic' : typ === 'image/webp' ? 'webp' : 'jpg';
        foto_path = userId + '/' + state.id + '.' + ext;
        const up = await sb.storage.from(BUCKET).upload(foto_path, state.blob, { contentType: typ, upsert: true });
        if (up.error) throw up.error;
      }

      setMsg('Sparar…');
      const tid = $('fynd-tid').value ? new Date($('fynd-tid').value) : new Date();
      const row = {
        id: state.id,
        art: state.art,
        mangd: state.mangd,
        anteckning: $('fynd-not').value.trim() || null,
        lat: state.point.lat,
        lon: state.point.lon,
        noggrannhet: state.point.noggrannhet,
        placerad: !!state.point.placerad,
        foto_path,
        funnen_at: tid.toISOString()
      };
      const { error } = await sb.from('svamp_fynd').insert(row);
      if (error) {
        if (foto_path) await sb.storage.from(BUCKET).remove([foto_path]);
        throw error;
      }

      store.set(LAST_ART_KEY, state.art);
      const namn = window.svampArt(state.art).namn;
      close();
      window.SvampMap.toast(namn + ' sparad', 'ok', 2500);
      if (onSaved) onSaved();
    } catch (err) {
      const m = (err && err.message) || '';
      setMsg(/fetch|network|load failed/i.test(m)
        ? 'Ingen kontakt med servern. Försök igen när du har täckning.'
        : 'Kunde inte spara: ' + m, 'error');
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- Popup: foto och ta bort ----------
  async function loadPopupPhoto(popup) {
    const root = popup.getElement && popup.getElement();
    const pop = root && root.querySelector('.pop');
    if (!pop || !pop.dataset.foto) return;
    const box = pop.querySelector('.pop-foto');
    if (!box || box.querySelector('img')) return;
    const res = await signedUrl(pop.dataset.foto);
    if (!res.url) {
      box.innerHTML = '<span class="pop-meta">Kunde inte hämta fotot: ' + (res.error || 'okänt fel') + '</span>';
      popup.update();
      return;
    }
    const img = new Image();
    img.alt = '';
    img.onload = () => { box.innerHTML = ''; box.appendChild(img); popup.update(); };
    img.onerror = () => { box.innerHTML = '<span class="pop-meta">Fotot kunde inte visas.</span>'; popup.update(); };
    img.addEventListener('click', () => window.open(res.url, '_blank'));
    img.src = res.url;
  }

  async function signedUrl(path) {
    const hit = urlCache.get(path);
    if (hit && hit.exp > Date.now()) return { url: hit.url };
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (error || !data || !data.signedUrl) return { url: null, error: error ? error.message : 'ingen länk' };
    urlCache.set(path, { url: data.signedUrl, exp: Date.now() + 50 * 60 * 1000 });
    return { url: data.signedUrl };
  }

  async function remove(pop) {
    if (!pop) return;
    if (!confirm('Ta bort fyndet? Det går inte att ångra.')) return;
    const { error } = await sb.from('svamp_fynd').delete().eq('id', pop.dataset.id);
    if (error) { window.SvampMap.toast('Kunde inte ta bort: ' + error.message, 'error', 5000); return; }
    if (pop.dataset.foto) await sb.storage.from(BUCKET).remove([pop.dataset.foto]);
    window.SvampMap.toast('Fyndet borttaget', 'ok', 2000);
    if (onSaved) onSaved();
  }

  return { setup, setUser, open };
})();
