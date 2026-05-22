/**
 * @file JsonExtractorApp.gs
 * Orchestrateur principal : coordonne ConfigService, JsonPathResolver, SheetWriter et ExtractionLogger.
 * Mode standalone : le spreadsheet cible est ouvert via openById() à partir de TARGET_SHEET_ID.
 */

class JsonExtractorApp {
  constructor() {
    this.ui = SpreadsheetApp.getUi();
    this.config = new ConfigService();
    this.resolver = new JsonPathResolver();
  }

  /**
   * Ouvre le spreadsheet cible configuré.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
   */
  _openTargetSpreadsheet() {
    const targetId = this.config.getTargetSheetId();
    if (!targetId) {
      this.ui.alert('⚠️ Configuration', 'Veuillez d'abord configurer la feuille cible.', this.ui.ButtonSet.OK);
      return null;
    }
    try {
      return SpreadsheetApp.openById(targetId);
    } catch (e) {
      this.ui.alert(
        '❌ Accès impossible',
        'Impossible d'ouvrir la feuille cible. Vérifiez l'ID ou les droits d'accès.\n\nDétail : ' + e.message,
        this.ui.ButtonSet.OK
      );
      return null;
    }
  }

  configureTargetSheet() {
    const response = this.ui.prompt(
      'Configuration de la feuille cible',
      'Collez le lien ou l'ID du Google Sheet dans lequel écrire les données :',
      this.ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() !== this.ui.Button.OK) return;

    const spreadsheetId = this.config.extractDriveFileId(response.getResponseText());
    if (!spreadsheetId) {
      this.ui.alert('❌ Erreur', 'Lien ou ID invalide.', this.ui.ButtonSet.OK);
      return;
    }

    try {
      const ss = SpreadsheetApp.openById(spreadsheetId);
      this.config.setTargetSheetId(spreadsheetId);

      const nameResponse = this.ui.prompt(
        'Onglet cible (optionnel)',
        `Nom de l'onglet dans lequel écrire les données.\nLaissez vide pour utiliser le premier onglet.\n\nOnglets disponibles : ${ss.getSheets().map(s => s.getName()).join(', ')}`,
        this.ui.ButtonSet.OK_CANCEL
      );
      if (nameResponse.getSelectedButton() === this.ui.Button.OK) {
        this.config.setTargetSheetName(nameResponse.getResponseText().trim());
      }

      this.ui.alert('✅ Feuille cible configurée', `Connecté à : ${ss.getName()}`, this.ui.ButtonSet.OK);
    } catch (e) {
      this.ui.alert(
        '❌ Accès impossible',
        'Impossible d'ouvrir ce Google Sheet.\n\nDétail : ' + e.message,
        this.ui.ButtonSet.OK
      );
    }
  }

  configureSource() {
    const response = this.ui.prompt(
      'Configuration de la source JSON',
      'Collez le lien complet du fichier JSON Google Drive, ou directement son ID :',
      this.ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== this.ui.Button.OK) return;

    const fileId = this.config.extractDriveFileId(response.getResponseText());

    if (!fileId) {
      this.ui.alert('❌ Erreur', 'Lien ou ID invalide. Impossible d'isoler l'ID du fichier Drive.', this.ui.ButtonSet.OK);
      return;
    }

    try {
      const file = DriveApp.getFileById(fileId);
      this.config.setFileId(fileId);
      this.ui.alert('✅ Source connectée', `Fichier connecté : ${file.getName()}`, this.ui.ButtonSet.OK);
    } catch (e) {
      this.ui.alert(
        '❌ Accès impossible',
        'Le fichier existe peut-être, mais vous n'avez pas les droits nécessaires, ou l'ID est incorrect.\n\nDétail : ' + e.message,
        this.ui.ButtonSet.OK
      );
    }
  }

  configureRootPath() {
    const currentRootPath = this.config.getRootPath();

    const response = this.ui.prompt(
      'Configuration du chemin racine',
      'Indiquez le chemin du tableau à extraire.\n\nExemples :\n- items\n- data.results\n- magasins\n\nLaissez vide si le JSON est directement un tableau.\n\nValeur actuelle : ' + (currentRootPath || '(vide)'),
      this.ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== this.ui.Button.OK) return;

    const rootPath = response.getResponseText().trim();
    this.config.setRootPath(rootPath);

    this.ui.alert(
      '✅ Configuration enregistrée',
      rootPath ? `Chemin racine configuré : ${rootPath}` : 'Aucun chemin racine configuré : le JSON entier sera utilisé.',
      this.ui.ButtonSet.OK
    );
  }

  configureChunkSize() {
    const current = this.config.getChunkSize();
    const response = this.ui.prompt(
      'Taille des lots d'écriture',
      `Nombre de lignes écrites par appel API Sheets.\nValeur actuelle : ${current}\nRecommandé : entre 200 et 2000.`,
      this.ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() !== this.ui.Button.OK) return;
    const value = Number(response.getResponseText().trim());
    if (!Number.isInteger(value) || value <= 0) {
      this.ui.alert('❌ Valeur invalide', 'Entrez un entier positif (ex : 500).', this.ui.ButtonSet.OK);
      return;
    }
    this.config.setChunkSize(value);
    this.ui.alert('✅ Enregistré', `Taille des lots : ${value}`, this.ui.ButtonSet.OK);
  }

  showCurrentConfiguration() {
    const config = this.config.getCurrentConfiguration();

    let jsonFileName = '(non configuré)';
    if (config.fileId) {
      try {
        jsonFileName = DriveApp.getFileById(config.fileId).getName();
      } catch (e) {
        jsonFileName = '(fichier inaccessible)';
      }
    }

    let targetSheetName = '(non configuré)';
    if (config.targetSheetId) {
      try {
        targetSheetName = SpreadsheetApp.openById(config.targetSheetId).getName();
      } catch (e) {
        targetSheetName = '(feuille inaccessible)';
      }
    }

    this.ui.alert(
      'Configuration actuelle',
      [
        `Source JSON : ${jsonFileName}`,
        `File ID : ${config.fileId || '(non configuré)'}`,
        `Chemin racine : ${config.rootPath || '(vide)'}`,
        `Feuille cible : ${targetSheetName}`,
        `Sheet ID : ${config.targetSheetId || '(non configuré)'}`,
        `Onglet cible : ${config.targetSheetName || '(premier onglet)'}`,
        `Taille des lots : ${config.chunkSize}`
      ].join('\n'),
      this.ui.ButtonSet.OK
    );
  }

  runExtraction() {
    const spreadsheet = this._openTargetSpreadsheet();
    if (!spreadsheet) return;

    const targetSheetName = this.config.getTargetSheetName();
    const sheet = targetSheetName
      ? (spreadsheet.getSheetByName(targetSheetName) || spreadsheet.getSheets()[0])
      : spreadsheet.getSheets()[0];

    if (sheet.getName() === 'Logs') {
      this.ui.alert('⚠️ Onglet invalide', 'L'extraction ne peut pas cibler l'onglet Logs.', this.ui.ButtonSet.OK);
      return;
    }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) {
      this.ui.alert('⏳ Occupé', 'Une extraction est déjà en cours.', this.ui.ButtonSet.OK);
      return;
    }

    const startedAt = new Date();
    const logger = new ExtractionLogger(spreadsheet);
    let fileId, rootPath, fileName = '';

    try {
      fileId = this.config.getFileId();
      rootPath = this.config.getRootPath();

      if (!fileId) {
        this.ui.alert('⚠️ Configuration', 'Veuillez d'abord configurer la source JSON.', this.ui.ButtonSet.OK);
        return;
      }

      const writer = new SheetWriter(sheet);
      const paths = writer.getHeaderPaths();

      if (paths.length === 0) {
        this.ui.alert('⚠️ En-têtes', 'Écrivez les clés JSON en ligne 1.', this.ui.ButtonSet.OK);
        return;
      }

      if (sheet.getLastRow() > 1) {
        const confirm = this.ui.alert(
          '⚠️ Données existantes',
          'L'onglet contient déjà des données. L'extraction va les remplacer. Continuer ?',
          this.ui.ButtonSet.OK_CANCEL
        );
        if (confirm !== this.ui.Button.OK) return;
      }

      spreadsheet.toast('⏳ Lecture du fichier JSON…', 'Extracteur JSON', -1);
      const file = DriveApp.getFileById(fileId);
      fileName = file.getName();
      const jsonData = JSON.parse(file.getBlob().getDataAsString('UTF-8'));

      const rootData = rootPath ? this.resolver.resolve(jsonData, rootPath) : jsonData;
      const dataArray = this._normalizeRootData(rootData);

      if (!dataArray || (Array.isArray(dataArray) && dataArray.length === 0)) {
        this.ui.alert('⚠️ Vide', 'Le chemin racine ne contient aucune donnée.', this.ui.ButtonSet.OK);
        return;
      }

      spreadsheet.toast(`⏳ Construction de ${dataArray.length} lignes…`, 'Extracteur JSON', -1);
      const rows = this._buildRows(dataArray, paths);

      if (rows.length > 0) {
        spreadsheet.toast('⏳ Écriture dans la feuille…', 'Extracteur JSON', -1);
        writer.clearPreviousData(paths.length, this.config.getLastColumns());
        writer.writeRows(rows, this.config.getChunkSize());
        writer.autofitColumns(paths.length);
        this.config.setLastColumns(paths.length);

        logger.log({
          status: 'SUCCESS',
          fileName,
          sourceFileId: fileId,
          targetSheetName: sheet.getName(),
          rootPath,
          rows: rows.length,
          columns: paths.length,
          durationSeconds: this._getDurationSeconds(startedAt),
          message: ''
        });

        spreadsheet.toast(`✅ Extraction réussie : ${rows.length} lignes.`, 'Extracteur JSON', 5);
      } else {
        this.ui.alert('⚠️ Aucune ligne', 'Les chemins définis en ligne 1 n'ont retourné aucune valeur.', this.ui.ButtonSet.OK);
      }
    } catch (e) {
      logger.log({
        status: 'ERROR',
        fileName,
        sourceFileId: fileId,
        targetSheetName: sheet.getName(),
        rootPath,
        rows: 0,
        columns: 0,
        durationSeconds: this._getDurationSeconds(startedAt),
        message: e.message
      });
      this.ui.alert('❌ Erreur', e.message, this.ui.ButtonSet.OK);
    } finally {
      lock.releaseLock();
    }
  }

  /**
   * Normalise la donnée racine en tableau (un objet seul devient un tableau d'un élément).
   * @param {*} rootData
   * @returns {Array}
   */
  _normalizeRootData(rootData) {
    if (rootData === null || rootData === undefined) return [];
    if (Array.isArray(rootData)) return rootData;
    return [rootData];
  }

  /**
   * @param {Array<Object>} dataArray
   * @param {string[]} paths
   * @returns {Array<Array<*>>}
   */
  _buildRows(dataArray, paths) {
    return dataArray.map(item => paths.map(path => this.resolver.resolveAsCellValue(item, path)));
  }

  /**
   * @param {Date} startedAt
   * @returns {string}
   */
  _getDurationSeconds(startedAt) {
    return ((new Date() - startedAt) / 1000).toFixed(2);
  }
}
