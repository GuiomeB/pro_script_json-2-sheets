/**
 * @file WebApp.gs
 * Point d'entrée de la web app JSON_2_Sheets v3.
 * Sert la page HTML et expose les fonctions serveur appelées via google.script.run.
 *
 * Déploiement requis :
 *   - Exécuter en tant que : Utilisateur accédant à l'application web
 *   - Accès : Tous les membres de l'organisation
 */

/**
 * Point d'entrée HTTP GET — sert la page principale de l'application.
 *
 * @param {GoogleAppsScript.Events.DoGet} e - Événement de requête (non utilisé en v3.0)
 * @returns {GoogleAppsScript.HTML.HtmlOutput} La page HTML de l'application
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('JSON → Sheets')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Extrait les clés de premier niveau d'un fichier JSON.
 * Supporte deux sources : fichier Drive (par ID) ou contenu JSON brut (local).
 *
 * @param {'drive'|'local'} sourceType - Origine du JSON
 * @param {string} sourceData - ID du fichier Drive OU contenu JSON string
 * @returns {string[]} Clés de premier niveau (branches) du JSON
 * @throws {Error} Si le fichier est inaccessible, vide ou structurellement invalide
 */
function extractJsonFields(sourceType, sourceData) {
  const jsonString = _readJsonSource(sourceType, sourceData);
  const parsed     = _parseJson(jsonString);
  return _extractKeys(parsed);
}

/**
 * Lit le contenu JSON selon la source.
 * @param {'drive'|'local'} sourceType
 * @param {string} sourceData
 * @returns {string} Contenu JSON brut
 */
function _readJsonSource(sourceType, sourceData) {
  if (sourceType === 'local') return sourceData;
  try {
    return DriveApp.getFileById(sourceData).getBlob().getDataAsString();
  } catch (e) {
    throw new Error('Impossible de lire ce fichier. Vérifiez qu\'il est bien accessible depuis votre Drive.');
  }
}

/**
 * Parse une chaîne JSON et lève une erreur compréhensible si invalide.
 * @param {string} jsonString
 * @returns {*} Valeur parsée
 */
function _parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Ce fichier ne contient pas de JSON valide.');
  }
}

/**
 * Extrait les clés de premier niveau depuis un objet ou un tableau d'objets.
 * @param {*} parsed - Valeur JSON parsée
 * @returns {string[]} Clés de premier niveau
 */
function _extractKeys(parsed) {
  const obj = Array.isArray(parsed) ? parsed[0] : parsed;

  if (Array.isArray(parsed) && parsed.length === 0) {
    throw new Error('Ce fichier JSON ne contient aucune donnée à extraire.');
  }
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Ce fichier JSON ne contient pas de données structurées en colonnes.');
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    throw new Error('Ce fichier JSON ne contient aucune donnée à extraire.');
  }
  return keys;
}

/**
 * Recherche des fichiers JSON dans le Drive de l'utilisateur connecté.
 * Appelée via google.script.run par le module DriveSearch côté client.
 *
 * @param {string} term - Terme de recherche (contenu dans le nom du fichier)
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
/**
 * Recherche des fichiers Google Sheets dans le Drive de l'utilisateur connecté.
 * Appelée via google.script.run par le module Destination (mode "Ajouter un onglet").
 *
 * @param {string} term - Terme de recherche (contenu dans le nom du fichier)
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
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

  // Ligne 1 : en-têtes
  sheet.getRange(1, 1, 1, fields.length).setValues([fields]);

  // Lignes de données (par lots pour éviter les timeouts GAS)
  if (data.length > 0) {
    _sheetWriteBatches(sheet, data, fields);
  }

  return url;
}

/**
 * Lit et parse le JSON source (Drive ou local).
 * Réutilise _readJsonSource et _parseJson définis pour extractJsonFields.
 * @returns {Object[]} Tableau d'objets à écrire
 */
function _getConvertData(source) {
  const raw    = source.type === 'drive' ? source.id : source.content;
  const parsed = _parseJson(_readJsonSource(source.type, raw));
  return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * Crée le fichier Sheets (mode 'new') ou insère un onglet (mode 'tab').
 * @returns {{ sheet: Sheet, url: string }}
 */
function _sheetPrepareTarget(destination) {
  if (destination.mode === 'new') {
    const ss    = SpreadsheetApp.create(destination.fileName);
    return { sheet: ss.getActiveSheet(), url: ss.getUrl() };
  }

  // mode 'tab' — ouvre le fichier existant
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

function searchDriveSheetsFiles(term) {
  const query = `title contains "${term}" and mimeType = "application/vnd.google-apps.spreadsheet" and trashed = false`;
  const iterator = DriveApp.searchFiles(query);
  const results = [];

  while (iterator.hasNext() && results.length < 10) {
    const file = iterator.next();
    results.push({ id: file.getId(), name: file.getName() });
  }

  return results;
}

function searchDriveJsonFiles(term) {
  const query = `title contains "${term}" and mimeType = "application/json" and trashed = false`;
  const iterator = DriveApp.searchFiles(query);
  const results = [];

  while (iterator.hasNext() && results.length < 10) {
    const file = iterator.next();
    results.push({ id: file.getId(), name: file.getName() });
  }

  return results;
}
