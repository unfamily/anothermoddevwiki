(async function () {
  const { resolvePage, resolveAnchor, slugify } = window.WikiResolve;
  const $ = id => document.getElementById(id);
  const manifest = await (await fetch('wiki.json')).json();
  const cache = {};
  const mdUrl = (slug, page) => `docs/${slug}/${encodeURIComponent(page)}.md`;
  const getMd = async (slug, page) => cache[slug + '/' + page] ??= fetch(mdUrl(slug, page)).then(r => r.ok ? r.text() : null);
  const modBy = slug => manifest.mods.find(m => m.slug === slug);

  // Theme
  const setTheme = t => { document.documentElement.dataset.theme = t; localStorage.theme = t; $('theme').textContent = t === 'dark' ? '☀️' : '🌙'; };
  setTheme(localStorage.theme || 'dark');
  $('theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  $('menu').onclick = () => document.body.classList.toggle('nav-open');

  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const slug = decodeURIComponent(parts[0] || '');
    const rest = decodeURIComponent(parts.slice(1).join('/') || '');
    const [page, anchor] = rest.split('#');
    return { slug, page: page || (slug ? 'Home' : ''), anchor };
  }

  const linkHtml = l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`;
  function footer(mod) {
    const parts = [];
    if (mod && mod.links && mod.links.length) parts.push(`<span class="f-mod">${mod.name}: ${mod.links.map(linkHtml).join(' · ')}</span>`);
    parts.push(`<span>${(manifest.links || []).map(linkHtml).join(' · ')}</span>`);
    $('footer').innerHTML = parts.join('');
  }
  function sidebar(cur) {
    $('sidebar').innerHTML = manifest.mods.map(m => {
      const open = cur && m.slug === cur.slug;
      const pages = open ? `<ul>${m.pages.map(p => `<li><a href="#/${m.slug}/${encodeURIComponent(p.page)}" class="${p.page === cur.page ? 'active' : ''}">${p.title}</a></li>`).join('')}</ul>` : '';
      return `<div class="mod${open ? ' open' : ''}"><a href="#/${m.slug}/Home">${m.logo ? `<img class="logo-sm" src="${m.logo}" alt="">` : ''}${m.name}</a>${pages}</div>`;
    }).join('');
  }

  function landing() {
    document.title = manifest.title;
    $('content').innerHTML = `<h1>${manifest.title}</h1><div class="cards">` +
      manifest.mods.map(m => `<a class="card" href="#/${m.slug}/Home">${m.logo ? `<img class="logo" src="${m.logo}" alt="${m.name}">` : ''}<h3>${m.name}</h3><span>${m.pages.length} pages</span></a>`).join('') + '</div>';
  }

  function rewriteLinks(el, mod) {
    const pages = mod.pages.map(p => p.page);
    el.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (/^(https?:|mailto:)/i.test(href)) {
        const gw = href.match(/github\.com\/[^/]+\/[^/]+\/wiki\/?([^#?]*)(#.*)?$/i); // link alla vecchia wiki dello stesso mod
        if (!gw) { a.target = '_blank'; a.rel = 'noopener'; return; }
      }
      if (href.startsWith('#')) { a.href = `#/${mod.slug}/${encodeURIComponent(currentPage)}${href}`; return; }
      if (/^(https?:|mailto:)/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; return; }
      const [t, anc] = href.replace(/^\.?\//, '').split('#');
      const p = resolvePage(t, pages);
      if (p) a.href = `#/${mod.slug}/${encodeURIComponent(p)}${anc ? '#' + anc : ''}`;
      else a.classList.add('broken');
    });
  }

  let currentPage = '';
  async function render() {
    const r = parseHash();
    $('results').hidden = true;
    document.body.classList.remove('nav-open');
    if (!r.slug) { sidebar(null); footer(null); return landing(); }
    const mod = modBy(r.slug);
    if (!mod) { sidebar(null); footer(null); return $('content').innerHTML = '<h1>Mod not found</h1>'; }
    let page = r.page;
    if (!mod.pages.some(p => p.page === page)) page = resolvePage(page, mod.pages.map(p => p.page)) || page;
    currentPage = page;
    sidebar({ slug: mod.slug, page }); footer(mod);
    let md = await getMd(mod.slug, page);
    if (md == null) return $('content').innerHTML = `<h1>Page not found</h1><p>${page}</p>`;
    md = md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b ? `[${a}](${b.trim()})` : `[${a}](${a.trim().replace(/\s+/g, '-')})`);
    const title = mod.pages.find(p => p.page === page)?.title || page;
    const art = $('content');
    art.innerHTML = `<div class="crumb"><a href="#/${mod.slug}/Home">${mod.logo ? `<img class="logo-sm" src="${mod.logo}" alt="">` : ''}${mod.name}</a> / ${title}</div>` +
      (/^\s*#\s/.test(md) ? '' : `<h1>${title}</h1>`) + marked.parse(md);
    const seen = {};
    art.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      let id = slugify(h.textContent); if (seen[id] != null) id += '-' + (++seen[id]); else seen[id] = 0;
      h.id = id;
    });
    rewriteLinks(art, mod);
    if (window.hljs) art.querySelectorAll('pre code').forEach(c => hljs.highlightElement(c));
    document.title = `${title} · ${mod.name}`;
    if (r.anchor) { const id = resolveAnchor(r.anchor, [...art.querySelectorAll('[id]')].map(e => e.id)); (id && document.getElementById(id) || art).scrollIntoView(); }
    else window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);
  render();

  // Ricerca su titoli e contenuto
  let indexReady = null;
  const buildIndex = () => indexReady ??= Promise.all(manifest.mods.flatMap(m => m.pages.map(async p => ({ m, p, text: ((await getMd(m.slug, p.page)) || '').toLowerCase() }))));
  $('search').addEventListener('focus', buildIndex);
  $('search').addEventListener('input', async e => {
    const q = e.target.value.trim().toLowerCase(), box = $('results');
    if (q.length < 2) return box.hidden = true;
    const idx = await buildIndex();
    const hits = idx.map(x => {
      const inTitle = x.p.title.toLowerCase().includes(q) || x.m.name.toLowerCase().includes(q);
      const pos = x.text.indexOf(q);
      return { ...x, score: (inTitle ? 10 : 0) + (pos >= 0 ? 1 : 0), pos };
    }).filter(x => x.score).sort((a, b) => b.score - a.score).slice(0, 30);
    box.innerHTML = hits.length ? hits.map(h => {
      const snip = h.pos >= 0 ? h.text.slice(Math.max(0, h.pos - 40), h.pos + 80).replace(/</g, '&lt;') : '';
      return `<a href="#/${h.m.slug}/${encodeURIComponent(h.p.page)}"><b>${h.p.page === 'Home' ? `Home: ${h.m.name}` : h.p.title}</b> <small>${h.m.name}</small><div>${snip}</div></a>`;
    }).join('') : '<p>No results</p>';
    box.hidden = false;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('results').hidden = true; });
})();
