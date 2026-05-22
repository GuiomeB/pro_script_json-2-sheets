/**
 * @file DriveApi.gs
 * Recherche de fichiers dans le Drive de l'utilisateur connecté.
 * Appelées via google.script.run depuis les modules DriveSearch et Destination (client).
 * Renommé depuis DriveSearch.gs — GAS interdit deux fichiers de même nom quelle que soit l'extension.
 */

/** Nombre max de résultats remontés au client. */
const _DRIVE_MAX_RESULTS = 10;
/** Plafond de fichiers parcourus, pour borner la latence d'une recherche large. */
const _DRIVE_MAX_SCAN = 200;

/**
 * Échappe backslashes puis guillemets pour éviter une injection dans la query Drive.
 * @param {string} term - Terme de recherche brut
 * @returns {string} Terme échappé
 */
function _escapeDriveQuery(term) {
  return term.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Exécute une query Drive et collecte jusqu'à _DRIVE_MAX_RESULTS fichiers.
 * @param {string} query - Query Drive (syntaxe API v2)
 * @param {(file: GoogleAppsScript.Drive.File) => boolean} [accept] - Filtre optionnel côté script
 * @returns {{ id: string, name: string }[]} Fichiers retenus
 */
function _runDriveQuery(query, accept) {
  const iterator = DriveApp.searchFiles(query);
  const results = [];
  let scanned = 0;
  while (iterator.hasNext() && results.length < _DRIVE_MAX_RESULTS && scanned < _DRIVE_MAX_SCAN) {
    const file = iterator.next();
    scanned++;
    if (accept && !accept(file)) continue;
    results.push({ id: file.getId(), name: file.getName() });
  }
  return results;
}

/**
 * Recherche des fichiers JSON dans le Drive de l'utilisateur connecté.
 * Filtre sur l'extension .json plutôt que le MIME : Drive stocke les .json
 * tantôt en application/json, tantôt en text/plain — le MIME seul en manque.
 * @param {string} term - Terme de recherche
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
function searchDriveJsonFiles(term) {
  const query = `title contains "${_escapeDriveQuery(term)}" and trashed = false`;
  return _runDriveQuery(query, function (file) {
    return /\.json$/i.test(file.getName());
  });
}

/**
 * Recherche des fichiers Google Sheets dans le Drive de l'utilisateur connecté.
 * Le MIME natif Google est fiable — pas de filtre d'extension nécessaire.
 * @param {string} term - Terme de recherche
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
function searchDriveSheetsFiles(term) {
  const query = `title contains "${_escapeDriveQuery(term)}" and ` +
    `mimeType = "application/vnd.google-apps.spreadsheet" and trashed = false`;
  return _runDriveQuery(query);
}

/**
 * Extrait un ID Drive depuis une URL complète ou un ID brut.
 * Tente le pattern /d/<ID> des URLs Drive, sinon le premier segment de 25+ caractères.
 * Logique reprise de la v2 (ConfigService.extractDriveFileId).
 * @param {string} input - URL Drive ou ID brut
 * @returns {string|null} ID extrait, ou null si introuvable
 */
function _extractDriveFileId(input) {
  if (!input) return null;
  const normalized = String(input).trim();
  const driveUrlMatch = normalized.match(/\/d\/([-\w]{25,})/);
  if (driveUrlMatch) return driveUrlMatch[1];
  const fallbackMatch = normalized.match(/[-\w]{25,}/);
  return fallbackMatch ? fallbackMatch[0] : null;
}

/**
 * Résout une URL Drive (ou un ID brut) en fichier accessible.
 * Appelée via google.script.run quand l'utilisateur colle un lien dans le champ source.
 * @param {string} urlOrId - URL complète ou ID du fichier
 * @returns {{ id: string, name: string }} Fichier résolu
 * @throws {Error} Si l'entrée n'est pas une URL/ID valide ou le fichier est inaccessible
 */
function resolveDriveFile(urlOrId) {
  const id = _extractDriveFileId(urlOrId);
  if (!id) {
    throw new Error('Lien ou identifiant invalide. Collez l\'URL complète du fichier, ou son identifiant.');
  }
  try {
    const file = DriveApp.getFileById(id);
    return { id: file.getId(), name: file.getName() };
  } catch (e) {
    throw new Error('Fichier introuvable ou inaccessible. Vérifiez le lien et vos droits d\'accès.');
  }
}
