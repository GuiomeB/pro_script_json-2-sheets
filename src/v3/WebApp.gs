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
 *   - searchDriveJsonFiles() / searchDriveSheetsFiles() → DriveApi.gs
 */

/**
 * Point d'entrée HTTP GET — sert la page principale de l'application.
 *
 * @param {GoogleAppsScript.Events.DoGet} e - Événement de requête (non utilisé)
 * @returns {GoogleAppsScript.HTML.HtmlOutput} La page HTML de l'application
 */
function doGet(e) {
  // createTemplateFromFile().evaluate() évalue les scriptlets <?!= ?> qui injectent
  // Styles.html et les modules JS. createHtmlOutputFromFile servirait le fichier brut.
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('JSON → Sheets')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
