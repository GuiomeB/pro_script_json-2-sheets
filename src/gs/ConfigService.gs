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
      CHUNK_SIZE: 'CHUNK_SIZE'
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
   * @param {string} input
   * @returns {string|null}
   */
  extractDriveFileId(input) {
    if (!input) return null;
    const match = String(input).trim().match(/[-\w]{25,}/);
    return match ? match[0] : null;
  }
}
