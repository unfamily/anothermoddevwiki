#!/usr/bin/env python3
"""Rigenera wiki.json scansionando docs/<slug>/*.md. Uso: python3 tools/build-manifest.py"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
# Nomi visualizzati opzionali: docs/<slug>/_meta.json {"name": "..."} altrimenti derivato dallo slug
mods = []
for slug in sorted(os.listdir(DOCS)):
    d = os.path.join(DOCS, slug)
    if not os.path.isdir(d): continue
    name = " ".join(w.capitalize() if not w.isupper() else w for w in slug.split("-"))
    meta = os.path.join(d, "_meta.json")
    links = []
    if os.path.exists(meta):
        m = json.load(open(meta, encoding="utf-8"))
        name = m.get("name", name); links = m.get("links", [])
    pages = []
    for f in sorted(os.listdir(d), key=lambda x: (x != "Home.md", x.lower())):
        if not f.endswith(".md") or f.startswith("_"): continue
        page = f[:-3]
        pages.append({"page": page, "title": "Home" if page == "Home" else page.replace("-", " ").replace("_", " ")})
    entry = {"name": name, "slug": slug, "pages": pages}
    if links: entry["links"] = links
    if os.path.exists(os.path.join(d, "logo.png")): entry["logo"] = f"docs/{slug}/logo.png"
    mods.append(entry)
with open(os.path.join(ROOT, "wiki.json"), "w", encoding="utf-8") as fh:
    json.dump({"title": "Another Mod Dev Wiki", "links": [{"label": "Wiki on GitHub", "url": "https://github.com/unfamily/anothermoddevwiki"}, {"label": "unfamily on GitHub", "url": "https://github.com/unfamily"}], "mods": mods}, fh, indent=2, ensure_ascii=False)
print(f"wiki.json: {len(mods)} mod, {sum(len(m['pages']) for m in mods)} pagine")
