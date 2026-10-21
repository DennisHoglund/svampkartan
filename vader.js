// Väder vid fyndet från Open-Meteo (gratis, ingen nyckel).
// Hämtar regn och medeltemperatur för de 10 dygn som slutar på fyndets datum.
window.SvampVader = (function () {
  'use strict';

  const DAGAR = 10;

  function ymd(d) {
    const z = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }

  async function hamta(lat, lon, tid) {
    const slut = new Date(tid);
    const start = new Date(slut);
    start.setDate(start.getDate() - (DAGAR - 1));
    const alderDagar = (Date.now() - slut.getTime()) / 86400000;

    // Senaste ~3 månaderna: prognos-API:t (har även färska dagar). Äldre: arkivet.
    const bas = alderDagar < 85
      ? 'https://api.open-meteo.com/v1/forecast'
      : 'https://archive-api.open-meteo.com/v1/archive';
    const url = bas + '?latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) +
      '&daily=precipitation_sum,temperature_2m_max,temperature_2m_min' +
      '&timezone=Europe%2FStockholm&start_date=' + ymd(start) + '&end_date=' + ymd(slut);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) return null;
      const j = await res.json();
      const d = j.daily || {};
      const regn = (d.precipitation_sum || []).map((v) => (v == null ? null : Math.round(v * 10) / 10));
      const max = d.temperature_2m_max || [];
      const min = d.temperature_2m_min || [];
      const medel = max.map((v, i) => (v == null || min[i] == null ? null : (v + min[i]) / 2)).filter((v) => v != null);
      const regnOk = regn.filter((v) => v != null);
      if (!regnOk.length && !medel.length) return null;
      return {
        regn_10d: Math.round(regnOk.reduce((a, b) => a + b, 0) * 10) / 10,
        temp_snitt: medel.length ? Math.round(medel.reduce((a, b) => a + b, 0) / medel.length * 10) / 10 : null,
        regn_dagar: regn,
        fran: ymd(start),
        till: ymd(slut),
        kalla: 'open-meteo'
      };
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function text(v) {
    if (!v) return '';
    const delar = [];
    if (v.regn_10d != null) delar.push('Regn 10 d: ' + String(v.regn_10d).replace('.', ',') + ' mm');
    if (v.temp_snitt != null) delar.push(String(v.temp_snitt).replace('.', ',') + ' °C');
    return delar.join(' · ');
  }

  return { hamta, text };
})();
