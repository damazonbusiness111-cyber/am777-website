/**
 * AM777 Automation Solutions — Inquiry → Google Sheets logger.
 *
 * Receives POSTs from the website (Custom Quote form + AI Assistant chat lead
 * capture) and appends one row per inquiry to a Google Sheet. Deploy as a
 * Web App and paste the /exec URL into AM777_SHEET_ENDPOINT in index.html.
 *
 * SETUP
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    (e.g. "AM777 Inquiries"). Note its name — any sheet works, a tab named
 *    "Leads" will be created automatically the first time a row is written.
 * 2. In the spreadsheet: Extensions → Apps Script.
 * 3. Delete any starter code in Code.gs and paste this entire file in its place.
 * 4. Click Deploy → New deployment.
 *    - Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy, then authorize the script with your Google account.
 * 5. Copy the Web App URL it gives you (ends in /exec).
 * 6. In index.html, find:
 *      window.AM777_SHEET_ENDPOINT = 'REPLACE_WITH_YOUR_APPS_SCRIPT_WEB_APP_URL';
 *    and paste your URL in place of the placeholder string.
 * 7. Every future edit to this script requires Deploy → Manage deployments →
 *    edit (pencil) → New version → Deploy, or the live URL keeps running the
 *    old code.
 *
 * NOTES
 * - The site calls this endpoint with fetch(..., {mode:'no-cors'}), so the
 *   browser never reads a response — this script is a silent copy alongside
 *   the honest mailto: submission, never the only record of an inquiry.
 * - No secrets are required and none should be added; this script only
 *   writes rows, it does not read or expose the sheet back to the site.
 */

var SHEET_NAME = 'Leads';
var HEADERS = [
  'Timestamp', 'Source', 'Full Name', 'Company', 'Email', 'Industry',
  'Team / Users', 'Budget', 'Timeline', 'Current Tools',
  'Operational Bottleneck', 'Desired Outcome', 'Message', 'Page URL'
];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.source || '',
      data.fullName || '',
      data.company || '',
      data.email || '',
      data.industry || '',
      data.teamSize || '',
      data.budget || '',
      data.timeline || '',
      data.currentTools || '',
      data.workflowProblem || '',
      data.desiredOutcome || '',
      data.message || '',
      data.page || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'AM777 lead logger is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
