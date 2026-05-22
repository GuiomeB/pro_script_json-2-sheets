/**
 * @file SheetWriter.gs
 * Création du fichier ou de l'onglet cible et écriture des données par lots.
 */

/**
 * Convertit un fichier JSON en tableau Google Sheets.
 * Crée le fichier ou l'onglet cible selon la destination, écrit les données par lots.
 *
 * @param {{ source: Object, fields: string[], destination: Object }} params
 * @returns {string} URL du fichier Sheets créé ou modifié
 */
function convertJsonToSheet(params) {
  const data        = _getConvertData(params.source);
  const { sheet, url } = _sheetPrepareTarget(params.destination);
  const fields      = params.fields;

  sheet.getRange(1, 1, 1, fields.length).setValues([fields]);

  if (data.length > 0) {
    _sheetWriteBatches(sheet, data, fields);
  }

  return url;
}

/**
 * Crée le fichier Sheets (mode 'new') ou insère un onglet (mode 'tab').
 * @param {{ mode: string, fileName?: string, spreadsheetId?: string, tabName?: string }} destination
 * @returns {{ sheet: GoogleAppsScript.Spreadsheet.Sheet, url: string }}
 */
function _sheetPrepareTarget(destination) {
  if (destination.mode === 'new') {
    const ss = SpreadsheetApp.create(destination.fileName);
    return { sheet: ss.getActiveSheet(), url: ss.getUrl() };
  }

  let ss;
  try {
    ss = SpreadsheetApp.openById(destination.spreadsheetId);
  } catch (e) {
    throw new Error('Impossible d\'ouvrir le fichier Sheets cible. Vérifiez vos droits d\'édition.');
  }
  const tabName = _sheetResolveTabName(ss, destination.tabName);
  const sheet   = ss.insertSheet(tabName);
  return { sheet: sheet, url: ss.getUrl() + '#gid=' + sheet.getSheetId() };
}

/**
 * Retourne un nom d'onglet unique en suffixant _2, _3… si nécessaire.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name - Nom souhaité
 * @returns {string} Nom disponible
 */
function _sheetResolveTabName(ss, name) {
  const existing = ss.getSheets().map(function (s) { return s.getName(); });
  if (!existing.includes(name)) return name;
  let n = 2;
  while (existing.includes(name + '_' + n)) n++;
  return name + '_' + n;
}

/**
 * Écrit les données dans la feuille par lots de 1000 lignes.
 * Les valeurs imbriquées (objets/tableaux) sont converties en JSON string.
 * Les clés absentes laissent la cellule vide.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object[]} data
 * @param {string[]} fields
 */
function _sheetWriteBatches(sheet, data, fields) {
  const BATCH = 1000;
  for (let start = 0; start < data.length; start += BATCH) {
    const rows = data.slice(start, start + BATCH).map(function (item) {
      return fields.map(function (field) {
        const val = item[field];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });
    });
    sheet.getRange(start + 2, 1, rows.length, fields.length).setValues(rows);
  }
}
