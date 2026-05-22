/**
 * @file DriveSearch.gs
 * Recherche de fichiers dans le Drive de l'utilisateur connecté.
 * Appelées via google.script.run depuis les modules DriveSearch et Destination (client).
 */

/**
 * Recherche des fichiers dans le Drive selon un type MIME donné.
 * @param {string} term - Terme de recherche
 * @param {string} mimeType - Type MIME Drive à filtrer
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
function _searchDriveFiles(term, mimeType) {
  const query = `title contains "${term}" and mimeType = "${mimeType}" and trashed = false`;
  const iterator = DriveApp.searchFiles(query);
  const results = [];
  while (iterator.hasNext() && results.length < 10) {
    const file = iterator.next();
    results.push({ id: file.getId(), name: file.getName() });
  }
  return results;
}

/**
 * Recherche des fichiers JSON dans le Drive de l'utilisateur connecté.
 * @param {string} term - Terme de recherche
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
function searchDriveJsonFiles(term) {
  return _searchDriveFiles(term, 'application/json');
}

/**
 * Recherche des fichiers Google Sheets dans le Drive de l'utilisateur connecté.
 * @param {string} term - Terme de recherche
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
function searchDriveSheetsFiles(term) {
  return _searchDriveFiles(term, 'application/vnd.google-apps.spreadsheet');
}
