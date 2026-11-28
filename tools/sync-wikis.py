#!/usr/bin/env python3
"""Sync GitHub wiki sources (git_wiki/*.wiki) into this site.

Rules
  git_wiki (GitHub backup):
    - same-wiki links are relative (GitHub-internal navigation)
    - links to another wiki point to that wiki on GitHub (external)
    - every Home.md carries the "moved to anothermoddevwiki.eu" banner
  site (docs/<slug>):
    - no banner
    - links only to the site itself (#/slug/Page or relative)

Usage: python3 tools/sync-wikis.py   (then commit + push, upload to Aruba)
"""
import os, re, glob, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GIT_WIKI = os.path.expanduser('~/git_wiki')
SITE = 'https://www.anothermoddevwiki.eu'
# slug -> local git_wiki folder name without .wiki
WIKIS = {
    'another-config-manager': 'AnotherConfigManager',
    'another-dynaimics': 'Another-Dynaimics',
    'another-stages': 'Another-Stages',
    'colossal-reactors': 'Colossal-Reactors',
    'iskandert-utilities': 'Iskandert_Utilities',
    'replication-ae2-bridge': 'Replication-AE2-Bridge',
}
ORG = 'Another-Mod-Dev-Team'
# GitHub owner for each wiki slug (non-transferred repos stay on unfamily)
GH_OWNER = {
    'another-config-manager': ORG,
    'another-dynaimics': ORG,
    'another-stages': ORG,
    'iskandert-utilities': ORG,
    'colossal-reactors': ORG,
    'replication-ae2-bridge': 'unfamily',
}
# Real GitHub repo name in URLs when it differs from the local wiki folder
GH_REPO = {
    'iskandert-utilities': 'iskandert_utilities',
}
# Extra transferred repos that may appear as links but have no local wiki clone
TRANSFERRED_REPOS = {
    'anotherconfigmanager': (ORG, 'AnotherConfigManager'),
    'another-dynaimics': (ORG, 'Another-Dynaimics'),
    'another-stages': (ORG, 'Another-Stages'),
    'iskandert_utilities': (ORG, 'iskandert_utilities'),
    'iskandert-library': (ORG, 'Iskandert-Library'),
    'anothermoddevwiki': (ORG, 'anothermoddevwiki'),
    'colossal-reactors': (ORG, 'Colossal-Reactors'),
}

def gh_repo(slug):
    return GH_REPO.get(slug, WIKIS[slug])

def gh_wiki_url(slug, page, anc):
    return f'https://github.com/{GH_OWNER[slug]}/{gh_repo(slug)}/wiki/{page}{anc}'

REPO2SLUG = {r.lower(): s for s, r in WIKIS.items()}
REPO2SLUG.update({gh_repo(s).lower(): s for s in WIKIS})
# matches wiki links and bare repo-root links (repo root -> that wiki's Home)
GH = re.compile(r'https?://github\.com/(?:unfamily|Another-Mod-Dev-Team)/([A-Za-z0-9_.-]+?)(?:\.wiki)?(?:/wiki(?:/([^)\s>"#]*))?)?/?(#[^)\s>"]*)?(?=[)\s>"]|$)', re.I)
ST = re.compile(r'https?://(?:www\.)?anothermoddevwiki\.eu/#/([a-z0-9-]+)(?:/([^)\s>"#]*))?(#[^)\s>"]*)?', re.I)
GH_REPO_LINK = re.compile(r'https?://github\.com/(?:unfamily|Another-Mod-Dev-Team)/([A-Za-z0-9_.-]+)', re.I)

def retarget_repo_links(text):
    """Rewrite leftover repo links (issues, releases, ...) to the current owner/name."""
    def sub(m):
        repo = m.group(1)
        key = repo.lower()
        slug = REPO2SLUG.get(key)
        if slug:
            return f'https://github.com/{GH_OWNER[slug]}/{gh_repo(slug)}'
        info = TRANSFERRED_REPOS.get(key)
        if info:
            return f'https://github.com/{info[0]}/{info[1]}'
        return m.group(0)
    return GH_REPO_LINK.sub(sub, text)

def banner(slug):
    u = f'{SITE}/#/{slug}/Home'
    return [
        '> [!IMPORTANT]',
        f'> ## 📖 This documentation has moved to [Another Mod Dev Wiki]({u})',
        f'> The **recommended** place to read these docs is now **[anothermoddevwiki.eu]({u})**: better navigation, full-text search across all my mods, and a cleaner layout.',
        '>',
        '> This GitHub wiki is still kept up to date as a backup, but the website is the primary source.',
    ]

def split_banner(lines):
    """Return (lines without banner, had_banner)."""
    out, i, had = [], 0, False
    while i < len(lines):
        if lines[i].startswith('> [!IMPORTANT]') and any('has moved to' in l for l in lines[i:i + 4]):
            had = True
            while i < len(lines) and lines[i].startswith('>'): i += 1
            if i < len(lines) and not lines[i].strip(): i += 1
            continue
        out.append(lines[i]); i += 1
    return out, had

def target(slug, page, anc):
    return slug, (page or 'Home'), (anc or '')

def fix_git(text, own):
    def gh(m):
        slug = REPO2SLUG.get(m.group(1).lower())
        if not slug: return m.group(0)
        s, p, a = target(slug, m.group(2), m.group(3))
        return p + a if s == own else gh_wiki_url(s, p, a)
    def st(m):
        s, p, a = target(m.group(1).lower(), m.group(2), m.group(3))
        if s not in WIKIS: return m.group(0)
        return p + a if s == own else gh_wiki_url(s, p, a)
    return retarget_repo_links(ST.sub(st, GH.sub(gh, text)))

def fix_site(text, own):
    def conv(s, p, a):
        if s not in WIKIS: return None
        return p + a if s == own else f'#/{s}/{p}{a}'
    def gh(m):
        slug = REPO2SLUG.get(m.group(1).lower())
        r = slug and conv(*target(slug, m.group(2), m.group(3)))
        return r or m.group(0)
    def st(m):
        r = conv(*target(m.group(1).lower(), m.group(2), m.group(3)))
        return r or m.group(0)
    return retarget_repo_links(ST.sub(st, GH.sub(gh, text)))

def main():
    for slug, repo in WIKIS.items():
        src = os.path.join(GIT_WIKI, repo + '.wiki')
        dst = os.path.join(ROOT, 'docs', slug)
        os.makedirs(dst, exist_ok=True)
        names = set()
        for f in sorted(glob.glob(os.path.join(src, '*.md'))):
            name = os.path.basename(f); names.add(name)
            lines, had = split_banner(open(f, encoding='utf-8').read().split('\n'))
            body = fix_git('\n'.join(lines), slug)
            # git_wiki: banner on Home, links GitHub-side
            if name == 'Home.md':
                bl = body.split('\n')
                h = next((i for i, l in enumerate(bl) if l.startswith('# ')), -1)
                bl[h + 1:h + 1] = [''] + banner(slug) + ([''] if h + 1 < len(bl) and bl[h + 1].strip() else [])
                git_text = '\n'.join(bl)
                git_text = re.sub(r'\n{3,}', '\n\n', git_text)
            else:
                git_text = body
            if git_text != open(f, encoding='utf-8').read():
                open(f, 'w', encoding='utf-8').write(git_text); print('git_wiki  ', repo, name)
            # site: no banner, links site-only
            site_text = fix_site('\n'.join(split_banner(git_text.split('\n'))[0]), slug)
            out = os.path.join(dst, name)
            if not os.path.exists(out) or open(out, encoding='utf-8').read() != site_text:
                open(out, 'w', encoding='utf-8').write(site_text); print('site      ', slug, name)
        for f in glob.glob(os.path.join(dst, '*.md')):
            if os.path.basename(f) not in names:
                os.remove(f); print('site rm   ', slug, os.path.basename(f))
    subprocess.run(['python3', os.path.join(ROOT, 'tools', 'build-manifest.py')])
    subprocess.run(['node', os.path.join(ROOT, 'tools', 'check-links.mjs')])

if __name__ == '__main__':
    main()
