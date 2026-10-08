# Go-live: jokiblox.com (Cloudflare + DomaiNesia + email)

Recommended setup: **Cloudflare Pages** hosts the site (free, global CDN, automatic HTTPS, deploys on every git push), **Cloudflare DNS + Email Routing** for the domain and `hello@jokiblox.com`, **DomaiNesia** only keeps the domain registration. The Nevacloud VPS isn't needed for a static site — keep it for the future agent backend (option B below if you still want it there).

Total time ≈ 20 min + DNS propagation (usually < 1 h, max 24 h).

## 1. Cloudflare — add the domain (5 min)
1. dash.cloudflare.com → **Add a domain** → `jokiblox.com` → **Free** plan.
2. Cloudflare scans existing records. Delete any old `A`/`CNAME` for `@` and `www` that point to DomaiNesia parking.
3. Cloudflare shows **two nameservers** (e.g. `xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`). Copy them.

## 2. DomaiNesia — point the domain to Cloudflare (2 min)
1. my.domainesia.com → **Domain → Domain Saya** → `jokiblox.com` → **Kelola / Manage**.
2. If **DNSSEC** is on, turn it off first.
3. **Nameserver** → *Gunakan nameserver kustom* → paste the two Cloudflare nameservers → **Simpan**.
4. Back in Cloudflare, click **Check nameservers**. The zone turns **Active** when propagation finishes (you get an email).

## 3. Cloudflare Pages — deploy the site (5 min)
1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → authorize GitHub → repo `WassupXes/RyanDevX`.
2. Settings:
   - Production branch: `claude/dazzling-galileo-xznxdg` (or `main` after merging)
   - Framework preset: **None** · Build command: *(empty)* · Build output directory: **`site`**
3. **Save and Deploy** → you get `jokiblox.pages.dev`. Open it and check.
4. Project → **Custom domains → Set up a custom domain** → `jokiblox.com` → Activate. Repeat for `www.jokiblox.com`. Cloudflare creates the DNS records and the SSL certificate automatically.
5. Optional: Rules → **Redirect Rules** → `www.jokiblox.com/*` → `https://jokiblox.com/${1}` (301).

From now on every `git push` to the production branch redeploys automatically.

## 4. Email — hello@jokiblox.com (5 min)
**Receiving (free):** Cloudflare → `jokiblox.com` → **Email → Email Routing → Get started**
1. Custom address `hello` → action **Send to an email** → your Gmail.
2. Gmail receives a verification email → click **Verify**.
3. Click **Add records and enable** (adds MX + SPF automatically).
4. Optional catch-all: route `*@jokiblox.com` to the same inbox.

**Sending as hello@ from Gmail (optional):** Gmail → Settings → Accounts → **Send mail as → Add another address** → `hello@jokiblox.com` → SMTP `smtp.gmail.com`, port 587, your Gmail address + a Google **App password** (myaccount.google.com/apppasswords, needs 2-Step Verification). Then in Cloudflare DNS edit the SPF TXT record to:
`v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`

Need real mailboxes for the team later? Use Google Workspace or Zoho Mail and replace the MX records.

## 5. Waitlist → Google Sheet (5 min)
Follow `apps-script/README.md`, then put the `/exec` URL in `site/assets/js/config.js` → `WAITLIST_ENDPOINT`, commit and push (Pages redeploys). Until then the form says "not connected yet".

## 6. Final checks
- `https://jokiblox.com` loads with a padlock; `/studio`, `/pricing`, `/waitlist` work.
- Submit a test signup → a row appears in the Sheet and the confirmation email arrives.
- Send an email to `hello@jokiblox.com` → it lands in Gmail.
- Share the link in WhatsApp/Telegram → preview shows the OG image.

---

## Option B — host on the Nevacloud VPS instead
1. app.nevacloud.com → your VM → **Console** → log in as root.
2. Run: `git clone https://github.com/WassupXes/RyanDevX.git /opt/jokiblox-src -b claude/dazzling-galileo-xznxdg && bash /opt/jokiblox-src/deploy/setup-vps.sh` (private repo → use a GitHub token as the password).
3. Cloudflare DNS: `A @ → VPS IP` and `A www → VPS IP`, **DNS only (grey cloud)** first.
4. On the VPS: `certbot --nginx -d jokiblox.com -d www.jokiblox.com`. Then switch both records to **Proxied (orange)** and set SSL/TLS mode to **Full (strict)**.
5. Updates: `bash /opt/jokiblox-src/deploy/update.sh`.

## Want Claude to do the Cloudflare part?
The cloud session's network policy currently blocks `api.cloudflare.com`. Add it under the session's environment → Edit → Network access → Allowed domains, then create a Cloudflare API token (My Profile → API Tokens → Create custom token) with:
- Account · Cloudflare Pages · Edit
- Account · Email Routing Addresses · Edit
- Zone · Zone · Edit, Zone · DNS · Edit, Zone · Email Routing Rules · Edit (Zone resources: all zones in the account)

Share the token + Account ID; revoke the token when done. The DomaiNesia nameserver change (step 2) still has to be done in your DomaiNesia account.
