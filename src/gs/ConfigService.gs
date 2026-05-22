/**
 * @file ConfigService.gs
 * Persistance de la configuration via PropertiesService (document-scoped).
 */

class ConfigService {
  constructor() {
    this.properties = PropertiesService.getDocumentProperties();

    this.keys = {
      FILE_ID: 'FILE_ID',
      ROOT_PATH: 'ROOT_PATH',
      CHUNK_SIZE: 'CHUNK_SIZE',
      LAST_COLUMNS: 'LAST_COLUMNS'
    };

    this.defaults = {
      CHUNK_SIZE: 1000
    };
  }

  /** @param {string} fileId */
  setFileId(fileId) {
    this.properties.setProperty(this.keys.FILE_ID, fileId);
  }

  /** @returns {string|null} */
  getFileId() {
    return this.properties.getProperty(this.keys.FILE_ID);
  }

  /** @param {string} rootPath */
  setRootPath(rootPath) {
    this.properties.setProperty(this.keys.ROOT_PATH, rootPath || '');
  }

  /** @returns {string} */
  getRootPath() {
    return this.properties.getProperty(this.keys.ROOT_PATH) || '';
  }

  /** @returns {number} */
  getChunkSize() {
    const value = Number(this.properties.getProperty(this.keys.CHUNK_SIZE));
    return value > 0 ? value : this.defaults.CHUNK_SIZE;
  }

  /** @param {number} size */
  setChunkSize(size) {
    const parsed = Number(size);
    if (parsed > 0) {
      this.properties.setProperty(this.keys.CHUNK_SIZE, String(parsed));
    }
  }

  /** @returns {number} nombre de colonnes de la dernière extraction réussie, 0 si aucune */
  getLastColumns() {
    return Number(this.properties.getProperty(this.keys.LAST_COLUMNS)) || 0;
  }

  /** @param {number} count */
  setLastColumns(count) {
    this.properties.setProperty(this.keys.LAST_COLUMNS, String(count));
  }

  /** @returns {{ fileId: string, rootPath: string, chunkSize: number }} */
  getCurrentConfiguration() {
    return {
      fileId: this.getFileId(),
      rootPath: this.getRootPath(),
      chunkSize: this.getChunkSize()
    };
  }

  /**
   * Extrait un ID Drive depuis une URL complète ou un ID brut.
   * Tente d'abord le pattern /d/<ID> présent dans les URLs Drive standards,
   * puis fall back sur le premier segment alphanumérique de 25+ caractères.
   * @param {string} input
   * @returns {string|null}
   */
  extractDriveFileId(input) {
    if (!input) return null;
    const normalized = String(input).trim();
    const driveUrlMatch = normalized.match(/\/d\/([-\w]{25,})/);
    if (driveUrlMatch) return driveUrlMatch[1];
    const fallbackMatch = normalized.match(/[-\w]{25,}/);
    return fallbackMatch ? fallbackMatch[0] : null;
  }
}
