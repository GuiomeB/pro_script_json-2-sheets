/**
 * @file WebApp.gs
 * Point d'entrée HTTP de la web app JSON_2_Sheets v3.
 *
 * Déploiement requis :
 *   - Exécuter en tant que : Utilisateur accédant à l'application web
 *   - Accès : Tous les membres de l'organisation
 *
 * Fonctions serveur exposées à google.script.run (dans les autres fichiers) :
 *   - extractJsonFields()   → JsonParser.gs
 *   - convertJsonToSheet()  → SheetWriter.gs
 *   - searchDriveJsonFiles() / searchDriveSheetsFiles() → DriveSearch.gs
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
