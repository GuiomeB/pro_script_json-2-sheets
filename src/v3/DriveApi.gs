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
 * Recherche des fichiers .json / .txt dans le Drive de l'utilisateur connecté.
 * Filtre sur l'extension (titre) plutôt que le MIME : Drive stocke les .json
 * de façon incohérente (application/json, text/plain, octet-stream…) — le MIME en manque.
 * @param {string} term - Terme de recherche
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
function searchDriveJsonFiles(term) {
  // Restreint la requête par extension dans le titre (et non par MIME : Drive stocke les .json
  // de façon incohérente). Évite que le plafond _DRIVE_MAX_SCAN soit épuisé par des fichiers
  // sans rapport. Le regex côté script garde la précision (suffixe exact .json/.txt).
  const safeTerm = _escapeDriveQuery(term);
  const query = `title contains "${safeTerm}" and ` +
    `(title contains ".json" or title contains ".txt") and trashed = false`;
  return _runDriveQuery(query, function (file) {
    return /\.(json|txt)$/i.test(file.getName());
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
