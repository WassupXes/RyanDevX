/**
 * JokiBlox waitlist → Google Sheet.
 * Deploy: Extensions > Apps Script (from the target Sheet) > paste this > Deploy > New deployment
 *         > Web app > Execute as: Me > Who has access: Anyone > copy the /exec URL
 *         into site/assets/js/config.js (WAITLIST_ENDPOINT).
 */
var SHEET_NAME = "Waitlist";
var SEND_CONFIRMATION = true; // sends a bilingual confirmation email from the deploying account
var FIELDS = ["email", "roblox_username", "role", "experience", "goals", "problem", "expectations",
              "plan", "model", "country", "source", "lang", "early_code", "utm", "page", "consent"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = (e && e.parameter) || {};
    var email = String(p.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: "invalid_email" });
    if (p.website) return json({ ok: true }); // honeypot

    var sheet = getSheet();
    var row = [new Date()].concat(FIELDS.map(function (k) { return clean(k === "email" ? email : p[k]); }));
    var existing = findRow(sheet, email);
    if (existing) {
      sheet.getRange(existing, 1, 1, row.length).setValues([row]); // latest answers win
    } else {
      sheet.appendRow(row);
      if (SEND_CONFIRMATION) sendConfirmation(email, p);
    }
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  var sheet = getSheet();
  return json({ ok: true, count: Math.max(0, sheet.getLastRow() - 1) });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["submitted_at"].concat(FIELDS));
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var emails = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) if (String(emails[i][0]).toLowerCase() === email) return i + 2;
  return 0;
}

// Strip leading =,+,-,@ so answers can't run as spreadsheet formulas.
function clean(v) {
  v = String(v == null ? "" : v).slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function sendConfirmation(email, p) {
  var id = p.lang === "id";
  var subject = id ? "Kamu masuk waitlist JokiBlox Agent 🎉" : "You're on the JokiBlox Agent waitlist 🎉";
  var body = id
    ? "Halo " + (p.roblox_username || "") + ",\n\nTerima kasih sudah gabung waitlist JokiBlox Agent!\n\n" +
      "Diskon early-bird 20% (12 bulan pertama) sudah dikunci untuk email ini.\nKode kamu: " + (p.early_code || "JOKI20") + "\n\n" +
      "Kami rilis November 2026 dan akan mengirim undangan beta sebelum itu.\n\n— Tim JokiBlox\nhttps://jokiblox.com"
    : "Hi " + (p.roblox_username || "") + ",\n\nThanks for joining the JokiBlox Agent waitlist!\n\n" +
      "Your 20% early-bird discount (first 12 months) is locked to this email.\nYour code: " + (p.early_code || "JOKI20") + "\n\n" +
      "We launch in November 2026 and will send beta invites before then.\n\n— The JokiBlox team\nhttps://jokiblox.com";
  try { MailApp.sendEmail({ to: email, subject: subject, body: body, name: "JokiBlox" }); } catch (err) { console.warn(err); }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
