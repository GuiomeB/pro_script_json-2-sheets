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
   * Les cellules vides sont ignorées : si la ligne 1 contient ["id", "", "name"],
   * seuls ["id", "name"] sont retournés et les données s'écriront en colonnes 1 et 2.
   * Les colonnes vides au milieu ne sont donc pas préservées comme séparateurs visuels.
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
   * Utilise le max entre le nombre de colonnes actuel et celui de la feuille pour
   * nettoyer également les colonnes orphelines d'une extraction précédente plus large.
   * @param {number} columnCount - nombre de colonnes de l'extraction courante
   */
  clearPreviousData(columnCount) {
    const lastRow = this.sheet.getLastRow();
    const effectiveColumns = Math.max(columnCount, this.sheet.getLastColumn());
    if (lastRow <= 1 || effectiveColumns <= 0) return;

    this.sheet.getRange(2, 1, lastRow - 1, effectiveColumns).clearContent();
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
