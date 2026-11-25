/**
 * Lil Think: adds each new subscriber to this Google Sheet.
 *
 * Setup (once):
 *  1. Open the sheet > Extensions > Apps Script, delete what is there and paste this whole file.
 *  2. Change SECRET below to a long random string of your own.
 *  3. Deploy > New deployment > type "Web app" > Execute as: Me > Who has access: Anyone > Deploy.
 *  4. Copy the web app URL (it ends in /exec) into Netlify as SHEETS_WEBHOOK_URL,
 *     and the same secret as SHEETS_WEBHOOK_SECRET.
 * After editing this file later: Deploy > Manage deployments > edit > Version: New version.
 */
const SECRET = "CHANGE-ME-to-a-long-random-string";
// Tab to write to. SHEET_GID is the number after "gid=" in the tab's URL; it wins over SHEET_NAME.
// Leave both empty (null and "") to use the first tab.
const SHEET_GID = 1483044572;
const SHEET_NAME = "";

// Column headings this script understands. Capitals, spaces and punctuation are ignored,
// so "Question Id", "question_id" and "QuestionID" all match.
const COLUMNS = {
  email: ["email", "emailaddress", "emailid", "useremail", "mail"],
  balance: ["balance"],
  questionId: ["questionid", "questionno", "questionnumber", "currentquestionid", "currentquestion"],
  subscribedAt: ["subscribedat", "subscribedon", "subscriptiondate", "createdat", "date", "timestamp", "joinedat"],
  source: ["source"],
};
const DEFAULT_HEADERS = ["Email", "Balance", "Question Id", "Subscribed At"];

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return reply({ ok: false, error: "invalid_json" }); }
  if (!data || data.secret !== SECRET || SECRET.indexOf("CHANGE-ME") === 0) return reply({ ok: false, error: "unauthorized" });

  const email = String(data.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reply({ ok: false, error: "invalid_email" });

  const lock = LockService.getScriptLock(); // two signups at the same moment must not overwrite each other
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_GID !== null ? ss.getSheets().filter(function (t) { return t.getSheetId() === SHEET_GID; })[0]
      : SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    if (!sheet) return reply({ ok: false, error: "sheet_not_found" });

    if (sheet.getLastRow() === 0) sheet.appendRow(DEFAULT_HEADERS); // empty sheet: create the heading row
    const width = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(norm);
    const col = {};
    Object.keys(COLUMNS).forEach(function (k) { col[k] = headers.findIndex(function (h) { return COLUMNS[k].indexOf(h) !== -1; }); });
    if (col.email === -1) return reply({ ok: false, error: "no_email_column" });

    // One row per email
    const last = sheet.getLastRow();
    if (last > 1) {
      const emails = sheet.getRange(2, col.email + 1, last - 1, 1).getValues();
      for (let i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).trim().toLowerCase() === email) return reply({ ok: true, status: "exists" });
      }
    }

    const row = new Array(width).fill("");
    row[col.email] = safe(email);
    if (col.balance !== -1) row[col.balance] = Number(data.balance);
    if (col.questionId !== -1) row[col.questionId] = Number(data.questionId);
    if (col.subscribedAt !== -1) row[col.subscribedAt] = data.subscribedAt ? new Date(data.subscribedAt) : new Date();
    if (col.source !== -1) row[col.source] = safe(String(data.source || "").slice(0, 40));
    sheet.appendRow(row);
    return reply({ ok: true, status: "added" });
  } finally {
    lock.releaseLock();
  }
}

function norm(h) { return String(h).toLowerCase().replace(/[^a-z0-9]/g, ""); }
// Stops a value that starts with = + - @ from being run as a formula
function safe(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function reply(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
