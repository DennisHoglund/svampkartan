// Karta: lager, egen position och markörer för fynd.
window.SvampMap = (function () {
  'use strict';

  const VIEW_KEY = 'svamp-map-view';
  const LAYER_KEY = 'svamp-map-layer';
  const TRAILS_KEY = 'svamp-map-trails';
  const DEFAULT_VIEW = { lat: 59.76, lng: 18.70, zoom: 9 }; // Roslagen

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  let map = null;
  let fyndLayer = null;
  let posMarker = null;
  let accCircle = null;
  let watchId = null;
  let lastPos = null;
  let follow = false;

  function baseLayers() {
    return {
      'Terräng': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        subdomains: 'abc', maxNativeZoom: 17, maxZoom: 20,
        attribution: '© OpenStreetMap · SRTM · OpenTopoMap'
      }),
      'Karta': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19, maxZoom: 20, attribution: '© OpenStreetMap'
      }),
      'Stigar': L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        subdomains: 'abc', maxNativeZoom: 20, maxZoom: 20, attribution: '© OpenStreetMap · CyclOSM'
      }),
      'Satellit': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 19, maxZoom: 20, attribution: 'Esri, Maxar, Earthstar Geographics'
      })
    };
  }

  function savedView() {
    try {
      const v = JSON.parse(store.get(VIEW_KEY) || 'null');
      if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom)) return v;
    } catch (e) {}
    return null;
  }

  function init(onAdd) {
    if (map) { map.invalidateSize(); return; }

    const view = savedView() || DEFAULT_VIEW;
    map = L.map('map', { zoomControl: false, keyboard: false, maxZoom: 20, attributionControl: true })
      .setView([view.lat, view.lng], view.zoom);

    const layers = baseLayers();
    const overlays = {
      'Vandringsleder': L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        maxNativeZoom: 18, maxZoom: 20, opacity: 0.8, attribution: 'Waymarked Trails'
      })
    };
    const startLayer = layers[store.get(LAYER_KEY)] ? store.get(LAYER_KEY) : 'Terräng';
    layers[startLayer].addTo(map);
    setSatClass(startLayer);
    if (store.get(TRAILS_KEY) === '1') overlays['Vandringsleder'].addTo(map);
    L.control.layers(layers, overlays, { position: 'topright' }).addTo(map);
    map.on('overlayadd overlayremove', (e) => store.set(TRAILS_KEY, e.type === 'overlayadd' ? '1' : '0'));
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    map.on('baselayerchange', (e) => { store.set(LAYER_KEY, e.name); setSatClass(e.name); });
    map.on('moveend', () => {
      const c = map.getCenter();
      store.set(VIEW_KEY, JSON.stringify({ lat: c.lat, lng: c.lng, zoom: map.getZoom() }));
    });
    map.on('dragstart', () => setFollow(false));

    fyndLayer = L.layerGroup().addTo(map);

    document.getElementById('btn-locate').addEventListener('click', () => {
      if (lastPos) {
        setFollow(true);
        map.setView([lastPos.lat, lastPos.lng], Math.max(map.getZoom(), 15));
      } else {
        startWatch(true);
      }
    });
    document.getElementById('btn-add').addEventListener('click', () => onAdd && onAdd(currentPoint()));

    // Första gången utan sparad vy: hoppa till min position
    startWatch(!savedView());
  }

  function setSatClass(name) {
    document.getElementById('map').classList.toggle('sat', name === 'Satellit');
  }

  function setFollow(on) {
    follow = on;
    document.getElementById('btn-locate').classList.toggle('active', on);
  }

  function startWatch(center) {
    if (!('geolocation' in navigator)) { toast('Platstjänster saknas i den här webbläsaren.', 'error'); return; }
    if (center) setFollow(true);
    if (watchId !== null) return;
    watchId = navigator.geolocation.watchPosition(onPos, onPosError, {
      enableHighAccuracy: true, maximumAge: 10000, timeout: 20000
    });
  }

  function onPos(p) {
    const first = !lastPos;
    lastPos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
    const ll = [lastPos.lat, lastPos.lng];
    if (!posMarker) {
      accCircle = L.circle(ll, { radius: lastPos.acc, className: 'acc-circle', interactive: false }).addTo(map);
      posMarker = L.circleMarker(ll, { radius: 8, className: 'pos-dot', interactive: false }).addTo(map);
    } else {
      posMarker.setLatLng(ll);
      accCircle.setLatLng(ll).setRadius(lastPos.acc);
    }
    if (follow) map.setView(ll, first ? Math.max(map.getZoom(), 15) : map.getZoom(), { animate: !first });
  }

  function onPosError(err) {
    setFollow(false);
    if (err.code === 1) toast('Tillåt platsåtkomst för Safari i Inställningar → Integritet → Platstjänster.', 'error');
    else toast('Kunde inte hitta din position.', 'error');
  }

  // Punkt för nytt fynd: min position om den finns, annars kartans mitt
  function currentPoint() {
    if (lastPos) return { lat: lastPos.lat, lon: lastPos.lng, noggrannhet: lastPos.acc, placerad: false };
    const c = map.getCenter();
    return { lat: c.lat, lon: c.lng, noggrannhet: null, placerad: true };
  }

  function pinIcon(farg, pending) {
    return L.divIcon({
      className: 'fynd-pin' + (pending ? ' pending' : ''),
      html: '<svg viewBox="0 0 24 32" width="26" height="34" aria-hidden="true">' +
            '<path d="M12 1C6 1 2 5.5 2 11c0 7.5 10 20 10 20s10-12.5 10-20C22 5.5 18 1 12 1z" fill="' + farg + '" stroke="#fff" stroke-width="2"/>' +
            '<circle cx="12" cy="11" r="3.5" fill="#fff"/></svg>',
      iconSize: [26, 34], iconAnchor: [13, 33], popupAnchor: [0, -30]
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function showFynd(list) {
    if (!fyndLayer) return;
    fyndLayer.clearLayers();
    list.forEach((f) => {
      const art = window.svampArt(f.art);
      const datum = new Date(f.funnen_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
      const pending = !!f._pending;
      const html = '<div class="pop" data-id="' + esc(f.id) + '" data-foto="' + esc(pending ? '' : (f.foto_path || '')) + '" data-pending="' + (pending ? '1' : '') + '">' +
                   (pending ? '<p class="pop-pending">Väntar på uppladdning' + (f._harFoto ? ' (med foto)' : '') + '</p>' : '') +
                   (!pending && f.foto_path ? '<div class="pop-foto"><span class="pop-meta">Laddar foto…</span></div>' : '') +
                   '<strong>' + esc(art.namn) + '</strong><br>' +
                   '<span class="pop-meta">' + esc(datum) + ' · mängd ' + esc(f.mangd) + '</span>' +
                   (f.vader ? '<br><span class="pop-meta">' + esc(window.SvampVader.text(f.vader)) + '</span>' : '') +
                   (f.anteckning ? '<p class="pop-not">' + esc(f.anteckning) + '</p>' : '') +
                   '<button type="button" class="pop-delete">Ta bort</button></div>';
      L.marker([f.lat, f.lon], { icon: pinIcon(art.farg, pending) }).bindPopup(html, { maxWidth: 260, minWidth: 200 }).addTo(fyndLayer);
    });
  }

  let toastTimer = null;
  function toast(text, kind, ms) {
    const el = document.getElementById('toast');
    el.textContent = text;
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms || 3500);
  }

  // Placeringsläge: kartan centreras på punkten, användaren drar kartan och bekräftar
  function pickPoint(start) {
    return new Promise((resolve) => {
      const ui = document.getElementById('place-ui');
      setFollow(false);
      map.setView([start.lat, start.lon], Math.max(map.getZoom(), 17));
      ui.hidden = false;
      const done = (val) => {
        ui.hidden = true;
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        resolve(val);
      };
      const okBtn = document.getElementById('btn-place-ok');
      const cancelBtn = document.getElementById('btn-place-cancel');
      const onOk = () => { const c = map.getCenter(); done({ lat: c.lat, lon: c.lng, noggrannhet: null, placerad: true }); };
      const onCancel = () => done(null);
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  }

  function onPopupOpen(fn) { map.on('popupopen', (e) => fn(e.popup)); }

  return { init, showFynd, toast, pickPoint, onPopupOpen, currentPoint: () => currentPoint(),
           invalidate: () => map && map.invalidateSize() };
})();
