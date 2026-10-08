#!/usr/bin/env python3
"""Build static pages: src/pages/*.html + src/partials -> site/*.html

Shorthand inside src files:
  [[English text||Teks Indonesia]]  ->  <span lang="en">..</span><span lang="id">..</span>
Each page starts with a front-matter block:
  ---
  title_en: ...
  title_id: ...
  desc: ...
  path: /pricing
  ---
Run: python3 build.py   (re-run after editing anything in site/assets too: URLs are versioned)
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "site"
SITE_URL = "https://jokiblox.com"

I18N = re.compile(r"\[\[(.+?)\|\|(.+?)\]\]", re.S)


OPTION = re.compile(r"<option([^>]*)>\[\[(.+?)\|\|(.+?)\]\]</option>")


def i18n(text: str) -> str:
    # <option> can't hold spans: keep both labels as attributes, main.js swaps the text.
    text = OPTION.sub(lambda m: f'<option{m[1]} data-en="{m[2]}" data-id="{m[3]}">{m[2]}</option>', text)
    return I18N.sub(lambda m: f'<span lang="en">{m[1]}</span><span lang="id">{m[2]}</span>', text)


def bust(html: str) -> str:
    """Append ?v=<content hash> to local CSS/JS URLs so browsers never mix a new page with an old cached file."""
    def ver(m):
        f = OUT / m[1]
        return m[0] if not f.exists() else f'{m[1]}?v={hashlib.md5(f.read_bytes()).hexdigest()[:8]}"'
    return re.sub(r'(assets/(?:css|js)/[\w.-]+\.(?:css|js))"', ver, html)


def parse(page: str):
    m = re.match(r"---\n(.*?)\n---\n", page, re.S)
    meta = dict(line.split(": ", 1) for line in m[1].splitlines() if line.strip())
    return meta, page[m.end():]


def main():
    head = (SRC / "partials/head.html").read_text()
    header = (SRC / "partials/header.html").read_text()
    footer = (SRC / "partials/footer.html").read_text()
    pages = []
    for f in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse(f.read_text())
        html = head + header + body + footer
        for key, val in {**meta, "url": SITE_URL + meta["path"]}.items():
            html = html.replace(f"%%{key}%%", val)
        if meta.get("noindex"):  # reachable by link, kept out of search and the sitemap
            html = html.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"', 1)
        if f.stem == "404":  # served from any path, so resolve relative links from the root
            html = html.replace("<head>", '<head>\n<base href="/">', 1)
        out = OUT / f.name
        out.write_text(bust(i18n(html)))
        if f.stem != "404" and not meta.get("noindex"):
            pages.append(meta["path"])
        print("built", out.relative_to(ROOT))
    leftover = [p for p in OUT.glob("*.html") if "[[" in p.read_text() or "]]" in p.read_text()]
    if leftover:
        raise SystemExit(f"Unexpanded [[EN||ID]] markers in: {leftover}")
    urls = "\n".join(f"  <url><loc>{SITE_URL}{p}</loc></url>" for p in pages)
    (OUT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n'
    )


if __name__ == "__main__":
    main()
