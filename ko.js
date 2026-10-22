// Offline-kö: fynd (med foto) sparas först i telefonen (IndexedDB) och laddas
// upp till Supabase så fort det finns täckning. Inget fynd tappas bort.
window.SvampKo = (function () {
  'use strict';

  const DB_NAME = 'svampkartan';
  const STORE = 'ko';
  const BUCKET = 'svamp-foton';
  let dbPromise = null;
  let syncing = null;
  const listeners = new Set();

  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function tx(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(STORE, mode);
      const result = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  // Foton sparas som ArrayBuffer, inte Blob: Safari i privat läge (och WebKit i tester)
  // kan inte lagra Blob i IndexedDB, men ArrayBuffer fungerar överallt.
  async function put(item) {
    const rad = Object.assign({}, item);
    if (rad.blob) {
      rad.data = await rad.blob.arrayBuffer();
      delete rad.blob;
    }
    await tx('readwrite', (s) => s.put(rad));
    changed();
  }

  function fotoBlob(item) {
    if (item.blob) return item.blob;
    if (item.data) return new Blob([item.data], { type: item.typ || 'image/jpeg' });
    return null;
  }
  const del = (id) => tx('readwrite', (s) => s.delete(id)).then(changed);
  const all = () => tx('readonly', (s) => s.getAll()).then((r) => r || []);

  async function forUser(userId) {
    return (await all()).filter((i) => i.userId === userId);
  }

  function changed() { listeners.forEach((fn) => { try { fn(); } catch (e) {} }); }
  function onChange(fn) { listeners.add(fn); }

  function isNetworkError(err) {
    const m = (err && (err.message || String(err))) || '';
    return !navigator.onLine || /fetch|network|load failed|timed? ?out|abort/i.test(m);
  }

  // Ladda upp allt i kön för användaren. Returnerar { sent, left, error }.
  function sync(sb, userId) {
    if (syncing) return syncing;
    syncing = (async () => {
      let sent = 0;
      let error = null;
      try {
        const items = (await forUser(userId)).sort((a, b) => a.created - b.created);
        for (const item of items) {
          if (!navigator.onLine) break;
          const row = Object.assign({}, item.row);

          const blob = fotoBlob(item);
          if (blob && item.fotoPath) {
            const up = await sb.storage.from(BUCKET).upload(item.fotoPath, blob, { contentType: item.typ || 'image/jpeg', upsert: true });
            if (up.error) throw up.error;
            row.foto_path = item.fotoPath;
          }

          if (!row.vader && window.SvampVader) {
            row.vader = await window.SvampVader.hamta(row.lat, row.lon, new Date(row.funnen_at));
          }

          // upsert: samma fynd kan skickas igen utan dubbletter om förra försöket bröts
          const { error: dbErr } = await sb.from('svamp_fynd').upsert(row, { onConflict: 'id' });
          if (dbErr) throw dbErr;

          await del(item.id);
          sent++;
        }
      } catch (err) {
        error = err;
      }
      const left = (await forUser(userId)).length;
      return { sent, left, error, offline: error ? isNetworkError(error) : false };
    })().finally(() => { syncing = null; });
    return syncing;
  }

  return { put, del, all, forUser, sync, onChange, isNetworkError, harFoto: (i) => !!(i.blob || i.data) };
})();
