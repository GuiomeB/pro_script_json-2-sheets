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
