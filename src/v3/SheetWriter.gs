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
 * Nettoie un nom d'onglet pour respecter les contraintes Google Sheets :
 * - Caractères interdits supprimés : / \ ? * [ ] :
 * - Apostrophes supprimées en début/fin
 * - Tronqué à 30 caractères (limite Sheets)
 * - Fallback sur "Export" si le résultat est vide
 * @param {string} name
 * @returns {string}
 */
function _sanitizeTabName(name) {
  const safe = name
    .replace(/[/\\?*[\]:]/g, '')
    .replace(/^'+|'+$/g, '')
    .trim()
    .substring(0, 30);
  return safe || 'Export';
}

/**
 * Retourne un nom d'onglet unique en suffixant _2, _3… si nécessaire.
 * La base est tronquée à 27 caractères pour laisser de la place au suffixe.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name - Nom souhaité (brut, sera sanitisé)
 * @returns {string} Nom disponible, ≤ 30 caractères
 */
function _sheetResolveTabName(ss, name) {
  const sanitized = _sanitizeTabName(name);
  const existing  = ss.getSheets().map(function (s) { return s.getName(); });
  if (!existing.includes(sanitized)) return sanitized;
  // Tronque la base à 27 pour réserver 3 chars au suffixe (_2 … _99)
  const base = sanitized.substring(0, 27);
  let n = 2;
  while (existing.includes(base + '_' + n)) n++;
  return base + '_' + n;
}

/**
 * Normalise une valeur avant écriture dans Sheets :
 * - undefined/null → chaîne vide
 * - chaîne ISO 8601 (contient un T) → objet Date (Sheets l'écrit comme vraie date)
 * - objet/tableau → JSON string
 * - autres primitives → valeur brute
 * @param {*} val
 * @returns {string|number|boolean|Date}
 */
function _normalizeValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    const d = new Date(val);
    if (!isNaN(d)) return d;
  }
  if (typeof val === 'object') return JSON.stringify(val);
  return val;
}

/**
 * Écrit les données dans la feuille par lots de 1000 lignes.
 * Les entrées non-objet (null, primitives) du tableau JSON sont traitées comme lignes vides.
 * Les chaînes ISO 8601 sont converties en Date. Les objets imbriqués → JSON string.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Array} data
 * @param {string[]} fields
 */
function _sheetWriteBatches(sheet, data, fields) {
  const BATCH = 1000;
  for (let start = 0; start < data.length; start += BATCH) {
    const rows = data.slice(start, start + BATCH).map(function (item) {
      return fields.map(function (field) {
        const val = (item && typeof item === 'object') ? item[field] : undefined;
        return _normalizeValue(val);
      });
    });
    sheet.getRange(start + 2, 1, rows.length, fields.length).setValues(rows);
  }
}
