/**
 * @file main.gs
 * Points d'entrée Google Apps Script : menu UI + fonctions globales déléguant à JsonExtractorApp.
 */

/**
 * Crée le menu personnalisé à l'ouverture du spreadsheet.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 Extracteur JSON')
    .addItem('1. Configurer la source JSON', 'configurerSourceJson')
    .addItem('2. Configurer le chemin racine', 'configurerCheminRacine')
    .addSeparator()
    .addItem('3. Extraire les données', 'executerExtractionJson')
    .addSeparator()
    .addItem('Voir la configuration actuelle', 'afficherConfiguration')
    .addToUi();
}

function configurerSourceJson() {
  const app = new JsonExtractorApp();
  app.configureSource();
}

function configurerCheminRacine() {
  const app = new JsonExtractorApp();
  app.configureRootPath();
}

function executerExtractionJson() {
  const app = new JsonExtractorApp();
  app.runExtraction();
}

function afficherConfiguration() {
  const app = new JsonExtractorApp();
  app.showCurrentConfiguration();
}
