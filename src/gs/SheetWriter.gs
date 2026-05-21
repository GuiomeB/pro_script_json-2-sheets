/**
 * @file SheetWriter.gs
 * Écriture des données extraites dans un onglet Google Sheets (par lots pour limiter les appels API).
 */

class SheetWriter {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   */
  constructor(sheet) {
    this.sheet = sheet;
  }

  /**
   * Lit les chemins JSON définis en ligne 1 (en-têtes).
   * @returns {string[]}
   */
  getHeaderPaths() {
    const lastColumn = this.sheet.getLastColumn();
    if (lastColumn === 0) return [];

    const headers = this.sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    return headers.map(header => String(header).trim()).filter(Boolean);
  }

  /**
   * Efface les données de la ligne 2 jusqu'à la dernière ligne (conserve les en-têtes).
   * @param {number} columnCount
   */
  clearPreviousData(columnCount) {
    const lastRow = this.sheet.getLastRow();
    if (lastRow <= 1 || columnCount <= 0) return;

    this.sheet.getRange(2, 1, lastRow - 1, columnCount).clearContent();
  }

  /**
   * Écrit les lignes par lots pour éviter les timeouts GAS sur les grands jeux de données.
   * @param {Array<Array<*>>} rows
   * @param {number} chunkSize
   */
  writeRows(rows, chunkSize) {
    if (!rows || rows.length === 0) return;

    const columnCount = rows[0].length;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      this.sheet.getRange(2 + i, 1, chunk.length, columnCount).setValues(chunk);
    }
  }

  /**
   * Ajuste automatiquement la largeur des colonnes après écriture.
   * @param {number} columnCount
   */
  autofitColumns(columnCount) {
    if (columnCount > 0) {
      this.sheet.autoResizeColumns(1, columnCount);
    }
  }
}
