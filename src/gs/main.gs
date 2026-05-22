/**
 * @file main.gs
 * Points d'entrée Google Apps Script : menu UI + fonctions globales déléguant à JsonExtractorApp.
 * En mode standalone, onOpen() ne se déclenche pas automatiquement. Pour l'activer sur un
 * spreadsheet cible, installer un trigger onOpen via Déclencheurs dans l'éditeur Apps Script.
 */

/**
 * Crée le menu personnalisé dans le spreadsheet cible.
 * À appeler manuellement ou via un trigger installable sur le spreadsheet cible.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 Extracteur JSON')
    .addItem('1. Configurer la feuille cible', 'configurerFeuilleCible')
    .addItem('2. Configurer la source JSON', 'configurerSourceJson')
    .addItem('3. Configurer le chemin racine', 'configurerCheminRacine')
    .addItem('4. Configurer la taille des lots', 'configurerTailleLots')
    .addSeparator()
    .addItem('5. Extraire les données', 'executerExtractionJson')
    .addSeparator()
    .addItem('Voir la configuration actuelle', 'afficherConfiguration')
    .addToUi();
}

function configurerFeuilleCible() {
  const app = new JsonExtractorApp();
  app.configureTargetSheet();
}

function configurerSourceJson() {
  const app = new JsonExtractorApp();
  app.configureSource();
}

function configurerCheminRacine() {
  const app = new JsonExtractorApp();
  app.configureRootPath();
}

function configurerTailleLots() {
  const app = new JsonExtractorApp();
  app.configureChunkSize();
}

function executerExtractionJson() {
  const app = new JsonExtractorApp();
  app.runExtraction();
}

function afficherConfiguration() {
  const app = new JsonExtractorApp();
  app.showCurrentConfiguration();
}
