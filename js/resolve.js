// Risoluzione link stile GitHub wiki. Usato dal browser e da tools/check-links.mjs
(function (root) {
  const norm = s => decodeURIComponent(s).toLowerCase().replace(/\.md$/, '').replace(/[^a-z0-9]/g, '');
  function lev(a, b) {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1, m[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return m[a.length][b.length];
  }
  // Ritorna il nome pagina (es. "Turbine-electromagnetic-coils") oppure null
  function resolvePage(target, pages) {
    const t = norm(target);
    if (!t) return null;
    const exact = pages.find(p => norm(p) === t);
    if (exact) return exact;
    // fuzzy: prefissi per parola ("turbine-elec-coils" -> "turbine-electromagnetic-coils")
    const tw = decodeURIComponent(target).toLowerCase().split(/[-_\s]+/).filter(Boolean);
    let best = null, bestScore = -1;
    for (const p of pages) {
      const pw = p.toLowerCase().split(/[-_\s&]+/).filter(Boolean);
      let i = 0, hit = 0;
      for (const w of tw) { while (i < pw.length && !pw[i].startsWith(w)) i++; if (i < pw.length) { hit++; i++; } }
      const ratio = hit / tw.length;
      const score = ratio - lev(t, norm(p)) / 100;
      if (ratio === 1 && score > bestScore) { best = p; bestScore = score; }
    }
    if (best) return best;
    for (const p of pages) { const d = lev(t, norm(p)); if (d <= Math.max(2, t.length * 0.25) && (bestScore < 0 || d < -bestScore)) { best = p; bestScore = -d; } }
    return best;
  }
  // Slug heading stile GitHub
  function slugify(text) {
    return text.trim().toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
  }
  // Anchor: esatto, altrimenti heading con il prefisso alfabetico comune più lungo (anchor vecchi/numeri di versione cambiati)
  function resolveAnchor(anchor, ids) {
    const a = decodeURIComponent(anchor).toLowerCase();
    if (ids.includes(a)) return a;
    const letters = s => s.replace(/[^a-z]/g, '');
    const la = letters(a); let best = null, bl = 0;
    for (const id of ids) { const li = letters(id); let n = 0; while (n < la.length && la[n] === li[n]) n++;
      if (n > bl) { bl = n; best = id; } }
    return bl >= Math.min(6, la.length) ? best : null;
  }
  const api = { resolvePage, resolveAnchor, slugify, norm };
  if (typeof module !== 'undefined') module.exports = api; else root.WikiResolve = api;
})(this);
