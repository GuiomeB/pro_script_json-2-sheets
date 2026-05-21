/**
 * @file ExtractionLogger.gs
 * Journalisation des extractions (succès et erreurs) dans l'onglet "Logs" du spreadsheet.
 */

class ExtractionLogger {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet
   */
  constructor(spreadsheet) {
    this.spreadsheet = spreadsheet;
    this.sheetName = 'Logs';
  }

  /**
   * Ajoute une ligne dans l'onglet Logs.
   * @param {{ status: string, fileName: string, sourceFileId: string, targetSheetName: string,
   *           rootPath: string, rows: number, columns: number, durationSeconds: string, message: string }} entry
   */
  log(entry) {
    const sheet = this._getOrCreateLogSheet();

    sheet.appendRow([
      new Date(),
      this._getUserEmail(),
      entry.status || '',
      entry.fileName || '',
      entry.sourceFileId || '',
      entry.targetSheetName || '',
      entry.rootPath || '',
      entry.rows || 0,
      entry.columns || 0,
      entry.durationSeconds || '',
      entry.message || ''
    ]);
  }

  /**
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  _getOrCreateLogSheet() {
    let sheet = this.spreadsheet.getSheetByName(this.sheetName);

    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(this.sheetName);

      sheet.appendRow([
        'Timestamp', 'User', 'Status', 'FileName', 'SourceFileId',
        'TargetSheet', 'RootPath', 'Rows', 'Columns', 'DurationSeconds', 'Message'
      ]);

      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 11);
    }

    return sheet;
  }

  /** @returns {string} */
  _getUserEmail() {
    try {
      return Session.getActiveUser().getEmail() || '';
    } catch (e) {
      return '';
    }
  }
}
