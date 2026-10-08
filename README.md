# jokiblox.com — JokiBlox Agent website

Marketing site + waitlist for **JokiBlox Agent**, the AI game-dev squad for Roblox creators. Static HTML/CSS/JS, bilingual (EN / ID), no framework.

## Pages
| File | What |
|---|---|
| `index.html` | Home: hero Studio demo, stats with sources, products, Multiplayer Mode race, migration demo, UGC demo, upgrade report, model router, FAQ |
| `studio.html` | Interactive Roblox Studio tour: install → connect → describe → plan → squad build → review & publish |
| `products.html` | Create · Migrate & fix · Remix & upgrade · Assets · Clothing/UGC · AI integration diagram |
| `pricing.html` | Free / Starter $12 / Pro $29 / Studio $79, monthly/yearly toggle, 20% early-bird, token cost table, top-ups |
| `waitlist.html` | Form: email, Roblox username, role, experience, goals, problem, expectations, plan, model, country, source |
| `terms.html`, `privacy.html` | Bilingual Terms (incl. refunds, acceptable use) and Privacy (UU PDP) |

## Structure
```
src/partials/   head, header, footer (shared)
src/pages/      page bodies — text written as [[English||Indonesia]]
site/           ← deploy this folder (built pages + assets)
site/assets/js/config.js   waitlist endpoint, launch date, discount
apps-script/    Google Sheets waitlist backend
deploy/         nginx config + VPS scripts
docs/STRATEGY.md  USP data & sources, AI integration, pricing logic, open assumptions
```

## Edit → build
1. Edit text in `src/pages/*.html` or `src/partials/*.html`. Bilingual text: `[[English||Bahasa Indonesia]]`.
2. `python3 build.py` → writes `site/*.html` + `sitemap.xml` (fails if a marker is left unexpanded).
3. CSS/JS live directly in `site/assets/` — edit there, no build needed.

Language: auto-detected from the browser (`id-*` → Indonesian), switchable with EN/ID, remembered in localStorage, or forced with `?lang=id`.

## Go-live checklist
**Step-by-step (Cloudflare Pages + DomaiNesia + email): see [`docs/GO-LIVE.md`](docs/GO-LIVE.md).**

1. **Waitlist backend** — follow `apps-script/README.md`, paste the `/exec` URL into `site/assets/js/config.js` → `WAITLIST_ENDPOINT`. Until then the form shows "not connected yet".
2. **Deploy** (pick one):
   - **VPS (nginx)** — in the server console: `curl -fsSLO https://raw.githubusercontent.com/WassupXes/RyanDevX/claude/dazzling-galileo-xznxdg/deploy/setup-vps.sh && bash setup-vps.sh` (private repo: clone manually with a GitHub token, then run `deploy/setup-vps.sh`). Updates: `bash /opt/jokiblox-src/deploy/update.sh`.
   - **Cloudflare Pages / Netlify / Vercel** — connect the repo, no build command, output directory `site`.
   - **GitHub Pages** — publish the `site/` folder (`site/CNAME` already set to `jokiblox.com`).
3. **DNS** — `A jokiblox.com → server IP` and `A www → server IP` (or the CNAME your host gives).
4. **HTTPS** — VPS: `certbot --nginx -d jokiblox.com -d www.jokiblox.com`. Managed hosts do it automatically.
5. Create mailbox **hello@jokiblox.com**.

## Local preview
```
python3 -m http.server 8080 -d site
```
