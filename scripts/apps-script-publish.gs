/**
 * Toasty FC — Google Sheets Control Menu
 *   1. Publish to Website (ToastyFC.com) — triggers GitHub Actions static build (~45-60s)
 *   2. Log Match Attendance — checkbox popup to append MatchStats attendee rows cleanly
 *   3. Show NAS Folder Name — copies/displays the standard V:\ game folder name for Phase 2
 *
 * One-time setup (~2 minutes):
 *   1. Open "Toasty FC Database" -> Extensions -> Apps Script.
 *   2. Paste this entire file into Code.gs and click Save.
 *   3. Project Settings (gear icon) -> Script Properties -> Add script property:
 *        Property: GITHUB_PAT
 *        Value:    <fine-grained GitHub PAT with Actions: Read & Write on AustnG/ToastyFC ONLY>
 *   4. Reload your Google Sheet. A "Toasty FC" menu will appear in the top menu bar.
 */

const GITHUB_OWNER = 'AustnG';
const GITHUB_REPO = 'ToastyFC';
const WORKFLOW_FILE = 'deploy.yml';
const TARGET_BRANCH = 'main';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Toasty FC')
    .addItem('Publish to Website (ToastyFC.com)', 'publishToWebsite')
    .addSeparator()
    .addItem('Log Match Attendance...', 'openAttendanceDialog')
    .addItem('Get NAS Folder Name (Selected Match)', 'showNasFolderName')
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

/**
 * Opens a clean checkbox dialog to log who played in a match (appends rows to MatchStats).
 */
function openAttendanceDialog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const matchesSheet = ss.getSheetByName('Matches');
  const rosterSheet = ss.getSheetByName('Roster');
  const statsSheet = ss.getSheetByName('MatchStats');

  if (!matchesSheet || !rosterSheet || !statsSheet) {
    SpreadsheetApp.getUi().alert('Missing Matches, Roster, or MatchStats sheet.');
    return;
  }

  const matchRows = matchesSheet.getDataRange().getDisplayValues();
  const rosterRows = rosterSheet.getDataRange().getDisplayValues();
  const statRows = statsSheet.getDataRange().getDisplayValues();

  // Collect recent matches (last 20, newest first)
  const matches = [];
  for (let i = matchRows.length - 1; i >= 1 && matches.length < 20; i--) {
    const r = matchRows[i];
    if (!r[0]) continue;
    matches.push({
      id: r[0],
      seasonId: r[1],
      seasonName: r[2],
      date: r[3],
      opponent: r[5],
    });
  }

  // Group roster entries by seasonId
  const rosterBySeason = {};
  for (let i = 1; i < rosterRows.length; i++) {
    const r = rosterRows[i];
    const seasonId = (r[1] || '').trim();
    const playerId = (r[3] || '').trim();
    const playerName = (r[4] || '').trim();
    const number = (r[5] || '').trim();
    if (!seasonId || !playerId) continue;
    if (!rosterBySeason[seasonId]) rosterBySeason[seasonId] = [];
    rosterBySeason[seasonId].push({ playerId: playerId, playerName: playerName || playerId, number: number });
  }

  // Track already-logged playerIds per matchId
  const existingByMatch = {};
  for (let i = 1; i < statRows.length; i++) {
    const mId = (statRows[i][0] || '').trim();
    const pId = (statRows[i][2] || '').trim();
    if (!mId || !pId) continue;
    if (!existingByMatch[mId]) existingByMatch[mId] = {};
    existingByMatch[mId][pId] = true;
  }

  const payloadJson = JSON.stringify({
    matches: matches,
    rosterBySeason: rosterBySeason,
    existingByMatch: existingByMatch,
  });

  const html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><style>' +
      'body{font-family:Inter,Arial,sans-serif;padding:12px;color:#18181b;font-size:13px;}' +
      'label.hdr{display:block;font-weight:700;margin-bottom:4px;font-size:11px;text-transform:uppercase;color:#52525b;}' +
      'select{width:100%;padding:7px;margin-bottom:12px;border:1px solid #d4d4d8;border-radius:6px;}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:260px;overflow-y:auto;padding:8px;border:1px solid #e4e4e7;border-radius:6px;background:#fafafa;}' +
      '.item{display:flex;align-items:center;gap:6px;padding:4px;border-radius:4px;}' +
      '.item.logged{opacity:0.55;}' +
      '.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px;}' +
      'button{padding:8px 14px;border-radius:6px;border:none;cursor:pointer;font-weight:600;}' +
      '.primary{background:#b91c1c;color:#fff;}' +
      '.secondary{background:#e4e4e7;color:#18181b;}' +
      '#msg{margin-top:8px;font-size:12px;color:#047857;}' +
      '</style></head><body>' +
      '<label class="hdr">Select Match</label>' +
      '<select id="matchSelect"></select>' +
      '<label class="hdr">Check Players Who Attended (already logged are disabled)</label>' +
      '<div id="rosterGrid" class="grid"></div>' +
      '<div id="msg"></div>' +
      '<div class="actions">' +
      '<button class="secondary" onclick="google.script.host.close()">Close</button>' +
      '<button class="primary" id="saveBtn" onclick="submitAttendance()">Add Attendance Rows</button>' +
      '</div>' +
      '<script>' +
      'const DATA = ' + payloadJson + ';' +
      'const sel = document.getElementById("matchSelect");' +
      'const grid = document.getElementById("rosterGrid");' +
      'DATA.matches.forEach(m => {' +
      '  const opt = document.createElement("option");' +
      '  opt.value = m.id;' +
      '  opt.textContent = m.id + " · " + m.date + " vs " + m.opponent + " (" + m.seasonName + ")";' +
      '  sel.appendChild(opt);' +
      '});' +
      'function renderRoster() {' +
      '  grid.innerHTML = "";' +
      '  const m = DATA.matches.find(x => x.id === sel.value);' +
      '  if (!m) return;' +
      '  const players = DATA.rosterBySeason[m.seasonId] || [];' +
      '  const logged = DATA.existingByMatch[m.id] || {};' +
      '  players.forEach(p => {' +
      '    const isLogged = !!logged[p.playerId];' +
      '    const lbl = document.createElement("label");' +
      '    lbl.className = "item" + (isLogged ? " logged" : "");' +
      '    const cb = document.createElement("input");' +
      '    cb.type = "checkbox"; cb.value = p.playerId;' +
      '    if (isLogged) { cb.checked = true; cb.disabled = true; }' +
      '    lbl.appendChild(cb);' +
      '    const num = p.number ? ("#" + p.number + " ") : "";' +
      '    lbl.appendChild(document.createTextNode(num + p.playerName + (isLogged ? " (logged)" : "")));' +
      '    grid.appendChild(lbl);' +
      '  });' +
      '}' +
      'sel.addEventListener("change", renderRoster);' +
      'renderRoster();' +
      'function submitAttendance() {' +
      '  const mId = sel.value;' +
      '  const checked = Array.from(grid.querySelectorAll("input:checked:not(:disabled)")).map(el => el.value);' +
      '  if (!checked.length) { document.getElementById("msg").textContent = "No new players selected."; return; }' +
      '  document.getElementById("saveBtn").disabled = true;' +
      '  google.script.run.withSuccessHandler(res => {' +
      '    document.getElementById("msg").textContent = res;' +
      '    setTimeout(() => google.script.host.close(), 900);' +
      '  }).appendAttendanceRows(mId, checked);' +
      '}' +
      '</script></body></html>'
  )
    .setWidth(460)
    .setHeight(430);

  SpreadsheetApp.getUi().showModalDialog(html, 'Log Match Attendance');
}

/**
 * Appends blank-stat attendance rows (matchId + playerId) to MatchStats without disturbing ARRAYFORMULAs.
 */
function appendAttendanceRows(matchId, playerIds) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const statsSheet = ss.getSheetByName('MatchStats');
  if (!statsSheet) throw new Error('MatchStats sheet not found.');

  // Find last populated row based on column A (matchId) so ARRAYFORMULAs in B/D keep working cleanly
  const colA = statsSheet.getRange('A:A').getValues();
  let lastRow = 1;
  for (let i = colA.length - 1; i >= 0; i--) {
    if (String(colA[i][0] || '').trim() !== '') {
      lastRow = i + 1;
      break;
    }
  }

  const startRow = lastRow + 1;
  const rowsA = playerIds.map(function () { return [matchId]; });
  const rowsC = playerIds.map(function (pId) { return [pId]; });

  // Write ONLY col A (matchId) and col C (playerId) so ARRAYFORMULAs in col B (gameName) and col D (playerName) stay intact
  statsSheet.getRange(startRow, 1, rowsA.length, 1).setValues(rowsA);
  statsSheet.getRange(startRow, 3, rowsC.length, 1).setValues(rowsC);

  return 'Added ' + playerIds.length + ' attendance rows for ' + matchId + '!';
}

/**
 * Displays the standardized Synology V:\ NAS folder name for the currently selected Matches row.
 */
function showNasFolderName() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== 'Matches') {
    ui.alert('Select a match row in the "Matches" tab first.');
    return;
  }
  const row = sheet.getActiveCell().getRow();
  if (row < 2) {
    ui.alert('Select a match data row (row 2 or below).');
    return;
  }
  const vals = sheet.getRange(row, 1, 1, 6).getDisplayValues()[0];
  const matchId = (vals[0] || '').trim();
  const date = (vals[3] || '').trim().replace(/\//g, '-');
  const opponent = (vals[5] || '')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  if (!matchId || !date || !opponent) {
    ui.alert('Row ' + row + ' is missing id, date, or opponent.');
    return;
  }

  const folderName = date + '_' + matchId + '_' + opponent;
  ui.alert(
    'Phase 2 NAS Folder Name',
    'Create this folder on your Synology V:\\ drive:\n\n' +
      folderName +
      '\n\nPut raw Veo/Mevo clips inside:\n' +
      folderName +
      '\\raw\\',
    ui.ButtonSet.OK
  );
}
