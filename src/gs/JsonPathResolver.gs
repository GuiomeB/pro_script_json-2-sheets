/**
 * @file JsonPathResolver.gs
 * Résolution de chemins JSON (dot-notation + bracket), auto-découverte, et normalisation de valeurs.
 */

class JsonPathResolver {
  /**
   * Résout un chemin strict (dot-notation ou bracket-notation).
   * @param {Object} obj
   * @param {string} path
   * @returns {*}
   */
  resolve(obj, path) {
    if (!path || typeof path !== 'string') return obj;

    const normalizedPath = path.trim().replace(/\[(\d+)\]/g, '.$1');
    if (!normalizedPath) return obj;

    return normalizedPath.split('.').filter(Boolean).reduce((current, key) => {
      return (current !== null && current !== undefined) ? current[key] : undefined;
    }, obj);
  }

  /**
   * Recherche récursive (auto-découverte) : parcourt tout l'arbre jusqu'à trouver la clé.
   * @param {Object} obj
   * @param {string} keyToFind
   * @returns {*}
   */
  deepSearch(obj, keyToFind) {
    if (!keyToFind || obj === null || typeof obj !== 'object') return undefined;

    if (Array.isArray(obj)) {
      for (let item of obj) {
        const result = this.deepSearch(item, keyToFind);
        if (result !== undefined) return result;
      }
      return undefined;
    }

    if (Object.prototype.hasOwnProperty.call(obj, keyToFind)) {
      return obj[keyToFind];
    }

    for (let k in obj) {
      const result = this.deepSearch(obj[k], keyToFind);
      if (result !== undefined) return result;
    }
    return undefined;
  }

  /**
   * Normalise une valeur pour l'écriture en cellule Sheets.
   * - null/undefined → ''
   * - Dates ISO 8601 avec composante heure → objet Date (affiché nativement par Sheets)
   * - Dates ISO sans heure (ex: "2024-01-15") → laissées en string pour éviter le
   *   décalage UTC qui afficherait le jour précédent pour les timezones UTC+N
   * - Objets/tableaux → JSON.stringify
   * @param {*} value
   * @returns {string|Date|number|boolean}
   */
  normalizeValue(value) {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
      if (isoDateRegex.test(value) && value.includes('T')) {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) return parsedDate;
      }
    }

    return (Array.isArray(value) || typeof value === 'object') ? JSON.stringify(value) : value;
  }

  /**
   * Résolution avec fallback auto-découverte, puis normalisation.
   * Le fallback deepSearch ne s'applique que pour les chemins sans point (token simple) :
   * pour un chemin composé comme "address.city", si resolve échoue, deepSearch rechercherait
   * la clé littérale "address.city" (avec le point) — ce qui n'existe jamais en pratique.
   * @param {Object} obj
   * @param {string} path
   * @returns {string|Date|number|boolean}
   */
  resolveAsCellValue(obj, path) {
    if (!path) return '';

    let value = this.resolve(obj, path);

    if ((value === undefined || value === null) && !path.includes('.')) {
      value = this.deepSearch(obj, path);
    }

    return this.normalizeValue(value);
  }
}
