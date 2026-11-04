// Checks that the internal links of every .md resolve (same logic as the site). Usage: node tools/check-links.mjs
import fs from 'fs'; import { createRequire } from 'module';
const { resolvePage, resolveAnchor, slugify } = createRequire(import.meta.url)('../js/resolve.js');
const wiki = JSON.parse(fs.readFileSync('wiki.json', 'utf8'));
const ids = s => { const seen = {}, out = new Set(); let inCode = false;
  for (const l of s.split('\n')) { if (/^\s*```/.test(l)) inCode = !inCode; const m = !inCode && l.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (m) { let id = slugify(m[1].replace(/[*_`]|\[([^\]]*)\]\([^)]*\)/g, '$1')); if (seen[id] != null) id += '-' + (++seen[id]); else seen[id] = 0; out.add(id); } } return out; };
let bad = 0, ok = 0, fuzzy = [];
for (const m of wiki.mods) { const pages = m.pages.map(p => p.page); const src = {};
  for (const p of pages) src[p] = fs.readFileSync(`docs/${m.slug}/${p}.md`, 'utf8');
  for (const p of pages) for (const [, href] of src[p].replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '').matchAll(/\]\(([^)\s]+)[^)]*\)|\[\[([^\]|]+)/g).map(x => [0, x[1] ?? x[2]])) {
    if (/^(https?:|mailto:)/.test(href) || /\.(png|jpe?g|gif|svg)$/i.test(href)) continue;
    const [t, a] = href.split('#'); const target = t ? resolvePage(t, pages) : p;
    if (!target) { bad++; console.log(`UNRESOLVED ${m.slug}/${p}: ${href}`); continue; }
    if (t && target.toLowerCase().replace(/[-_]/g,'') !== t.toLowerCase().replace(/[-_]/g,'')) fuzzy.push(`${t} -> ${target}`);
    if (a) { const ii = [...ids(src[target])], r = resolveAnchor(a, ii); if (!r) { bad++; console.log(`ANCHOR? ${m.slug}/${p}: ${href}`); continue; } if (r !== a.toLowerCase()) fuzzy.push(`#${a} -> #${r}`); }
    ok++; } }
console.log(`OK ${ok}, issues ${bad}`); console.log('Fuzzy:', [...new Set(fuzzy)].join(', ') || 'none');
