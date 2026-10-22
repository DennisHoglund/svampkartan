// Nytt fynd: formulär, foto, spara, visa och ta bort.
window.SvampFynd = (function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const LAST_ART_KEY = 'svamp-last-art';
  const BUCKET = 'svamp-foton';
  const MAX_SIDE = 1280;      // längsta sida i pixlar
  const MAL_KB = 250;         // sikta på max ca 250 kB per foto
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
      $('foto-text').textContent = 'Byt foto (' + Math.round(state.blob.size / 1024) + ' kB)';
    } catch (err) {
      // Ladda aldrig upp originalet (flera MB) – be om ett annat foto i stället
      state.blob = null;
      $('fynd-foto').value = '';
      $('foto-preview').hidden = true;
      $('foto-text').textContent = 'Kunde inte läsa fotot – prova ett annat';
    }
  }

  // Avkoda bilden. createImageBitmap först, annars <img> (klarar HEIC i Safari).
  async function decode(file) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) {
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        await img.decode();
        return img;
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }
  }

  function toJpeg(src, side, quality) {
    const sw = src.naturalWidth || src.width;
    const sh = src.naturalHeight || src.height;
    const scale = Math.min(1, side / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);
    canvas.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);
    return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', quality));
  }

  // Skala ner till max 1280 px JPEG, och mer vid behov tills fotot är under ca 250 kB
  async function shrink(file) {
    const src = await decode(file);
    const steg = [[MAX_SIDE, 0.72], [MAX_SIDE, 0.6], [1024, 0.6], [900, 0.55]];
    let blob = null;
    for (const [side, q] of steg) {
      blob = await toJpeg(src, side, q);
      if (blob.size <= MAL_KB * 1024) break;
    }
    if (src.close) src.close();
    return blob;
  }

  // ---------- Spara ----------
  async function save(e) {
    e.preventDefault();
    if (!state || !userId) return;
    const btn = $('btn-save');
    btn.disabled = true;

    try {
      if (!state.blob && $('fynd-foto').files && $('fynd-foto').files.length) {
        throw new Error('Fotot hann inte förberedas – vänta en sekund och tryck Spara igen.');
      }

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
        foto_path: null,
        vader: null,
        funnen_at: tid.toISOString()
      };

      let fotoPath = null;
      let typ = null;
      if (state.blob) {
        typ = state.blob.type || 'image/jpeg';
        const ext = typ === 'image/png' ? 'png' : typ === 'image/heic' ? 'heic' : typ === 'image/webp' ? 'webp' : 'jpg';
        fotoPath = userId + '/' + state.id + '.' + ext;
      }

      // 1. Spara alltid i telefonen först – då försvinner inget även utan täckning
      await window.SvampKo.put({ id: row.id, userId, row, blob: state.blob, typ, fotoPath, created: Date.now() });

      store.set(LAST_ART_KEY, state.art);
      const namn = window.svampArt(state.art).namn;
      close();

      // 2. Försök ladda upp direkt
      const res = await sync();
      if (res && res.sent && !res.left) {
        window.SvampMap.toast(namn + ' sparad', 'ok', 2500);
      } else if (res && res.error && !res.offline) {
        window.SvampMap.toast(namn + ' sparad i telefonen. Uppladdning misslyckades: ' + (res.error.message || res.error), 'error', 6000);
      } else {
        window.SvampMap.toast(namn + ' sparad i telefonen – laddas upp när du har täckning', 'ok', 4000);
      }
    } catch (err) {
      setMsg('Kunde inte spara: ' + ((err && err.message) || err), 'error');
    } finally {
      btn.disabled = false;
    }
  }

  async function sync() {
    if (!userId) return null;
    const res = await window.SvampKo.sync(sb, userId);
    if (onSaved) onSaved();
    return res;
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
      popup.setContent(pop);
      return;
    }
    const img = new Image();
    img.alt = '';
    img.onload = () => { box.innerHTML = ''; box.appendChild(img); popup.setContent(pop); };
    img.onerror = () => { box.innerHTML = '<span class="pop-meta">Fotot kunde inte visas.</span>'; popup.setContent(pop); };
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
    if (pop.dataset.pending === '1') {
      await window.SvampKo.del(pop.dataset.id);
      window.SvampMap.toast('Fyndet borttaget', 'ok', 2000);
      if (onSaved) onSaved();
      return;
    }
    const { error } = await sb.from('svamp_fynd').delete().eq('id', pop.dataset.id);
    if (error) { window.SvampMap.toast('Kunde inte ta bort: ' + error.message, 'error', 5000); return; }
    if (pop.dataset.foto) await sb.storage.from(BUCKET).remove([pop.dataset.foto]);
    window.SvampMap.toast('Fyndet borttaget', 'ok', 2000);
    if (onSaved) onSaved();
  }

  // Fyll i väder i efterhand för fynd som saknar det (t.ex. sparade utan täckning)
  let backfilling = false;
  async function backfill(list) {
    if (backfilling) return;
    const saknar = (list || []).filter((f) => !f.vader).slice(0, 20);
    if (!saknar.length) return;
    backfilling = true;
    let andrade = 0;
    for (const f of saknar) {
      const v = await window.SvampVader.hamta(f.lat, f.lon, new Date(f.funnen_at));
      if (!v) continue;
      const { error } = await sb.from('svamp_fynd').update({ vader: v, updated_at: new Date().toISOString() }).eq('id', f.id);
      if (!error) andrade++;
    }
    backfilling = false;
    if (andrade && onSaved) onSaved();
  }

  return { setup, setUser, open, backfill, sync };
})();
