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
 * Recherche des fichiers JSON dans le Drive de l'utilisateur connecté.
 * Appelée via google.script.run par le module DriveSearch côté client.
 *
 * @param {string} term - Terme de recherche (contenu dans le nom du fichier)
 * @returns {{ id: string, name: string }[]} Fichiers trouvés, max 10 résultats
 */
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
