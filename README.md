# JSON_2_Sheets

Deux outils complémentaires pour convertir des fichiers JSON en tableaux Google Sheets, tous deux écrits en Google Apps Script (V8).

---

## v3 — Web App (recommandée)

Interface web déployée comme GAS Web App. Wizard 3 étapes : sélection de la source JSON, choix des champs, destination Sheets.

### Fonctionnalités

- Recherche d'un fichier JSON dans Google Drive **ou** upload depuis l'ordinateur
- Extraction automatique des champs de premier niveau
- Sélection individuelle des champs à conserver
- Destination : nouveau fichier Sheets **ou** ajout d'un onglet dans un fichier existant
- Détection et conversion automatique des dates ISO 8601 en cellules de date Sheets
- Écriture par lots (1 000 lignes) pour éviter les timeouts GAS

### Déploiement

1. Créer un nouveau projet Apps Script sur [script.google.com](https://script.google.com)
2. Copier chaque fichier de `src/v3/` dans un fichier dédié du projet (**respecter le nom exact**)
3. `Déployer > Nouveau déploiement > Application Web`
   - Exécuter en tant que : **Moi**
   - Accès : **Tous les utilisateurs de mon organisation** (ou Moi uniquement pour les tests)
4. Copier l'URL de déploiement et l'ouvrir dans un navigateur

### Structure `src/v3/`

```
Fichiers serveur (.gs)
├── WebApp.gs         doGet() — point d'entrée, < 15 lignes
├── JsonParser.gs     extractJsonFields() — analyse des champs JSON
├── SheetWriter.gs    convertJsonToSheet() — écriture dans Sheets
└── DriveApi.gs       searchDriveJsonFiles() / searchDriveSheetsFiles()

Fichiers client (.html assemblés par HtmlService)
├── index.html        structure HTML + scriptlets d'assemblage
├── Styles.html       CSS
├── App.html          contrôleur wizard + state + helpers UI partagés
├── DriveSearch.html  module recherche Drive (étape 1)
├── LocalUpload.html  module upload local (étape 1)
├── AnalyseJson.html  module analyse JSON (transition 1→2)
├── FieldSelector.html module sélection des champs (étape 2)
├── Destination.html  module choix de destination (étape 3)
└── Progression.html  module affichage progression/résultat + init
```

---

## v2 — Script spreadsheet (legacy)

Script attaché directement à un Google Spreadsheet. Résolution de chemins dot-notation arbitraires depuis les en-têtes de colonnes.

### Fonctionnalités

- Connexion à n'importe quel fichier JSON Drive (URL complète ou ID)
- Résolution de chemins dot-notation (`data.results[0].name`) avec fallback auto-découverte
- Détection et conversion automatique des dates ISO 8601
- Écriture par lots (configurable, défaut 1 000 lignes)
- Journalisation automatique dans un onglet `Logs`

### Déploiement

1. Ouvrir l'éditeur Apps Script du spreadsheet cible (`Extensions > Apps Script`)
2. Copier chaque fichier `.gs` de `src/gs/` dans un fichier dédié du projet
3. **Ordre de chargement recommandé :** `ConfigService` → `JsonPathResolver` → `SheetWriter` → `ExtractionLogger` → `JsonExtractorApp` → `main`
4. Sauvegarder et recharger le spreadsheet → le menu `🚀 Extracteur JSON` apparaît

### Utilisation

1. **Configurer la source JSON** — coller l'URL Drive ou l'ID du fichier JSON
2. **Configurer le chemin racine** — indiquer le chemin vers le tableau (ex. `data.items`), ou laisser vide si le JSON est directement un tableau
3. **Écrire les clés JSON en ligne 1** du spreadsheet cible (en-têtes = chemins de résolution)
4. **Extraire les données**

### Structure `src/gs/`

```
src/
├── JSON_to_sheets_v2.2.txt   fichier source d'origine
└── gs/
    ├── main.gs               onOpen() + fonctions globales GAS
    ├── ConfigService.gs      persistance configuration (PropertiesService)
    ├── JsonPathResolver.gs   résolution chemins JSON + normalisation valeurs
    ├── SheetWriter.gs        écriture dans Sheets par lots
    ├── ExtractionLogger.gs   journalisation onglet Logs
    └── JsonExtractorApp.gs   orchestrateur principal
```

---

## Agent harness

Ce repo utilise le **Simple AI Harness (taille S)**. Les agents doivent lire `AGENTS.md` avant toute tâche.
Workflow et conventions : `WORKFLOW.md`.
