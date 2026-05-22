/**
 * @file JsonParser.gs
 * Lecture et parsing du JSON source (Drive ou upload local).
 * Utilisé par extractJsonFields() et convertJsonToSheet().
 */

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
 * Déballe les enveloppes à clé unique pour atteindre les vraies colonnes.
 * Ex. : { infosMagasin: { codeMagasin, nomMagasin, … } } → { codeMagasin, nomMagasin, … }.
 * Descend tant que l'objet n'a qu'une seule clé pointant vers un objet simple.
 * @param {*} value - Objet à déballer
 * @returns {*} Objet déballé (ou la valeur d'origine si rien à déballer)
 */
function _unwrapSingleKey(value) {
  let current = value;
  while (
    current && typeof current === 'object' && !Array.isArray(current) &&
    Object.keys(current).length === 1
  ) {
    const inner = current[Object.keys(current)[0]];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      current = inner;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Extrait les clés de premier niveau depuis un objet ou un tableau d'objets.
 * Déballe au préalable les enveloppes à clé unique (cf. _unwrapSingleKey).
 * @param {*} parsed - Valeur JSON parsée
 * @returns {string[]} Clés de premier niveau
 */
function _extractKeys(parsed) {
  if (Array.isArray(parsed) && parsed.length === 0) {
    throw new Error('Ce fichier JSON ne contient aucune donnée à extraire.');
  }
  const obj = _unwrapSingleKey(Array.isArray(parsed) ? parsed[0] : parsed);

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
 * Lit et parse le JSON source pour la conversion.
 * @param {{ type: string, id?: string, content?: string }} source
 * @returns {Object[]} Tableau d'objets à écrire
 */
function _getConvertData(source) {
  const raw    = source.type === 'drive' ? source.id : source.content;
  const parsed = _parseJson(_readJsonSource(source.type, raw));
  const rows   = Array.isArray(parsed) ? parsed : [parsed];
  // Déballe chaque ligne comme _extractKeys → en-têtes et données restent alignés.
  return rows.map(_unwrapSingleKey);
}
