# Waitlist backend (Google Sheets, free)

1. Create a Google Sheet, e.g. **JokiBlox Waitlist**.
2. In the Sheet: **Extensions → Apps Script**. Replace the default code with `Code.gs` from this folder. Save.
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize, then copy the Web app URL (ends with `/exec`).
5. Paste it into `site/assets/js/config.js` → `WAITLIST_ENDPOINT`, then redeploy the site.
6. Test: submit the form on `/waitlist.html` → a row appears in the `Waitlist` tab.

Notes
- Same email submitted twice updates the existing row (no duplicates).
- `SEND_CONFIRMATION = true` sends a bilingual confirmation from the deploying Google account (MailApp quota: ~100/day on free Gmail, 1,500/day on Workspace). Set to `false` if you'll use a mailing tool instead.
- Opening the `/exec` URL in a browser returns `{"ok":true,"count":N}` — a quick sign-up counter.
- When you edit `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
