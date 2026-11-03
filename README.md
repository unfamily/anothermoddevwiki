# Another Mod Dev Wiki

Wiki unica e statica per tutte le mod. I file `.md` restano invariati e vengono renderizzati nel browser con JavaScript ([marked](https://marked.js.org) + highlight.js, inclusi in `lib/`, funziona offline). Nessuna build necessaria.

## Struttura

```
index.html            pagina unica (routing a hash: #/colossal-reactors/Reactor-Fuel)
css/style.css         stile (tema scuro di default, toggle in alto)
js/app.js             caricamento, sidebar, ricerca, riscrittura link
js/resolve.js         risoluzione link stile GitHub wiki (anche fuzzy)
lib/                  marked, highlight.js
docs/<mod-slug>/      i file .md della wiki di ogni mod (Home.md = pagina iniziale)
docs/<mod-slug>/_meta.json   {"name": "Nome visualizzato"} (opzionale)
wiki.json             manifest generato (mod + pagine)
tools/build-manifest.py   rigenera wiki.json
tools/check-links.mjs     controlla i link interni
```

## Aggiungere una wiki o una pagina

1. Crea `docs/<mod-slug>/` (minuscolo, con trattini) e copia dentro i `.md` (serve `Home.md`).
2. Facoltativo: `docs/<mod-slug>/_meta.json` con `{"name": "Nome Mod"}`.
3. Rigenera il manifest: `python3 tools/build-manifest.py`
4. Controlla i link: `node tools/check-links.mjs`

I link stile GitHub wiki (`[x](Declare-Duct)`, `[[Pagina]]`, `pagina#anchor`) vengono risolti senza distinzione di maiuscole/trattini/underscore, con fallback fuzzy (es. `turbine-elec-coils` → `Turbine-electromagnetic-coils`). I link esterni si aprono in una nuova scheda.

## Anteprima locale

`fetch()` non funziona aprendo `index.html` come file, serve un server HTTP:

```
python3 -m http.server 8000
```

poi apri http://localhost:8000

## Pubblicare su GitHub Pages

1. Push della repo su GitHub.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, cartella `/ (root)`.
3. Il file `.nojekyll` evita che Jekyll elabori i `.md`.

Funziona su qualunque hosting statico (Netlify, Cloudflare Pages, un server web qualsiasi): basta caricare la cartella.
