# JSON_2_Sheets

Script Google Apps Script qui extrait les données d'un fichier JSON stocké sur Google Drive et les écrit dans un onglet Google Sheets, à partir de chemins JSON définis en ligne 1 (en-têtes).

## Fonctionnalités

- Connexion à n'importe quel fichier JSON Drive (URL complète ou ID)
- Résolution de chemins dot-notation (`data.results[0].name`) avec fallback auto-découverte
- Détection et conversion automatique des dates ISO 8601 en objets Date Sheets
- Écriture par lots (configurable, défaut 1000 lignes) pour éviter les timeouts GAS
- Journalisation automatique dans un onglet `Logs`

## Déploiement

1. Ouvrir l'éditeur Apps Script du spreadsheet cible (`Extensions > Apps Script`)
2. Copier chaque fichier `.gs` de `src/gs/` dans un fichier dédié du projet
3. **Ordre de chargement recommandé :** `ConfigService` → `JsonPathResolver` → `SheetWriter` → `ExtractionLogger` → `JsonExtractorApp` → `main`
4. Sauvegarder et recharger le spreadsheet → le menu `🚀 Extracteur JSON` apparaît

## Utilisation

1. **Configurer la source JSON** — coller l'URL Drive ou l'ID du fichier JSON
2. **Configurer le chemin racine** — indiquer le chemin vers le tableau (ex. `data.items`), ou laisser vide si le JSON est directement un tableau
3. **Écrire les clés JSON en ligne 1** du spreadsheet cible (en-têtes = chemins de résolution)
4. **Extraire les données**

## Structure du projet

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

## Agent harness

Ce repo utilise le **Simple AI Harness (taille S)**. Les agents doivent lire `AGENTS.md` avant toute tâche.
Workflow et conventions : `WORKFLOW.md`.
