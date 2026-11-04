# Another Mod Dev Wiki

## Structure

```
index.html            single page (hash routing: #/colossal-reactors/Reactor-Fuel)
css/style.css         styles (dark theme by default, toggle in the header)
js/app.js             loading, sidebar, search, footer, link rewriting
js/resolve.js         GitHub-wiki-style link resolution (with fuzzy matching)
lib/                  marked, highlight.js
docs/<mod-slug>/      each mod's wiki .md files (Home.md = landing page)
docs/<mod-slug>/logo.png     mod logo (optional)
docs/<mod-slug>/_meta.json   {"name": "Display name", "links": [{"label": "...", "url": "..."}]} (optional)
wiki.json             generated manifest (mods + pages)
tools/build-manifest.py   regenerates wiki.json
tools/check-links.mjs     checks internal links
```

## Adding a wiki or a page

1. Create `docs/<mod-slug>/` (lowercase, dashes) and copy the `.md` files into it (`Home.md` is required).
2. Optional: add a `logo.png` and a `_meta.json` with the display name and footer links (GitHub, CurseForge, ...).
3. Regenerate the manifest: `python3 tools/build-manifest.py`
4. Check the links: `node tools/check-links.mjs`

GitHub-wiki-style links (`[x](Declare-Duct)`, `[[Page]]`, `page#anchor`) are resolved ignoring case, dashes and underscores, with a fuzzy fallback (e.g. `turbine-elec-coils` → `Turbine-electromagnetic-coils`). External links open in a new tab.

## Local preview

`fetch()` doesn't work when opening `index.html` as a file, so you need an HTTP server:

```
python3 -m http.server 8000
```

then open http://localhost:8000

## Publishing on GitHub Pages

1. Push the repository to GitHub.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. The `.nojekyll` file prevents Jekyll from processing the `.md` files.

It works on any static host (Netlify, Cloudflare Pages, any web server): just upload the folder.
