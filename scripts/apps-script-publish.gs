/**
 * Toasty FC — 1-Click "Publish to ToastyFC.com" Menu for Google Sheets
 *
 * Setup (one-time, ~2 minutes):
 * 1. Open "Toasty FC Database" -> Extensions -> Apps Script.
 * 2. Paste this entire file into Code.gs and click Save.
 * 3. Go to Project Settings (gear icon) -> Script Properties -> Add script property:
 *      Property: GITHUB_PAT
 *      Value:    <fine-grained GitHub PAT with Actions: Read & Write on AustnG/ToastyFC ONLY>
 * 4. Reload your Google Sheet. A new top menu "Toasty FC" -> "Publish to Website" will appear!
 */

const GITHUB_OWNER = 'AustnG';
const GITHUB_REPO = 'ToastyFC';
const WORKFLOW_FILE = 'deploy.yml';
const TARGET_BRANCH = 'main';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Toasty FC')
    .addItem('Publish to Website (ToastyFC.com)', 'publishToWebsite')
    .addToUi();
}

function publishToWebsite() {
  const ui = SpreadsheetApp.getUi();
  const pat = PropertiesService.getScriptProperties().getProperty('GITHUB_PAT');

  if (!pat) {
    ui.alert(
      'Setup Required',
      'Missing GITHUB_PAT script property.\n\nGo to Extensions -> Apps Script -> Project Settings -> Script Properties and add GITHUB_PAT (a fine-grained GitHub token with Actions: Read & Write permission on AustnG/ToastyFC).',
      ui.ButtonSet.OK
    );
    return;
  }

  const url =
    'https://api.github.com/repos/' +
    GITHUB_OWNER +
    '/' +
    GITHUB_REPO +
    '/actions/workflows/' +
    WORKFLOW_FILE +
    '/dispatches';

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + pat,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ ref: TARGET_BRANCH }),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code === 204) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Build triggered! ToastyFC.com will update in ~45–60 seconds.',
      'Toasty FC Publish',
      8
    );
  } else {
    ui.alert(
      'Publish Failed (HTTP ' + code + ')',
      'GitHub returned:\n' + response.getContentText(),
      ui.ButtonSet.OK
    );
  }
}
