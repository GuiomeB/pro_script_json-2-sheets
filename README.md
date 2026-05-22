# JSON_2_Sheets

**Json 2 Sheets** — convertit un fichier JSON (ou `.txt`) en tableau Google Sheets, via une Web App Google Apps Script accessible à toute l'organisation Google Workspace. Wizard 3 étapes (**source → champs → destination**), sans compétence technique requise.

## Fonctionnalités

- **Source au choix**, frictionless : recherche par **nom** dans Google Drive, **collage d'une URL ou d'un ID** de fichier, ou **upload local** — formats `.json` **et** `.txt`
- Extraction des champs avec déballage automatique des enveloppes à clé unique (`[{infosMagasin:{…}}]` → vraies colonnes)
- Sélection individuelle des champs à conserver
- Destination : **nouveau fichier** Sheets **ou** **ajout d'un onglet** dans un fichier existant
- Détection et conversion automatique des dates ISO 8601 en cellules de date Sheets
- Écriture par lots (1 000 lignes) pour éviter les timeouts GAS
- En-tête « Json 2 Sheets » avec **badge de version** synchronisé automatiquement depuis `package.json`

## Stack

Google Apps Script (runtime V8), déployé comme **Web App**. La page est assemblée côté serveur à partir de fragments HTML via les scriptlets HtmlService (`createTemplateFromFile('index').evaluate()`).

## Déploiement

**Première mise en place** (une fois) :
1. Créer un projet Apps Script sur [script.google.com](https://script.google.com) et reporter son scriptId dans `.clasp.json`.
2. `Déployer > Nouveau déploiement > Application Web` — Exécuter en tant que : **Utilisateur accédant à l'application web** ; Accès : **organisation** (cf. `src/appsscript.json`).
3. Ouvrir l'URL `/exec`.

**Synchroniser le code** avec clasp (fini le copier-coller manuel) :
```bash
npm install        # installe clasp en local (devDependency)
npm run login      # authentification Google (une seule fois)
npm run push       # envoie src/ vers le projet GAS
```
> `.clasp.json` (scriptId + rootDir) est versionné. Seul `~/.clasprc.json` (jetons OAuth) reste secret et n'est jamais commité.

Itération rapide : après `npm run push`, rafraîchir l'**URL `/dev`** (toujours à jour, accès propriétaire) — aucun redéploiement.

Publier sur l'**URL `/exec`** (partagée) : pointer le déploiement sur une nouvelle version :
```bash
npm run deployments                  # liste les deploymentId
npm run redeploy -- <deploymentId>   # met à jour l'URL /exec
```

| Script | Action |
|---|---|
| `npm run push` | Régénère la version puis pousse `src/` (force) |
| `npm run watch` | Régénère la version puis pousse à chaque sauvegarde |
| `npm run pull` | Récupère l'état distant (réconciliation) |
| `npm run status` | Liste les fichiers qui seraient poussés |
| `npm run open` | Ouvre l'éditeur Apps Script |

> **Badge de version** : `push`/`watch` régénèrent `src/Version.gs` depuis `package.json`. Pour publier une nouvelle version, bumpez `package.json` (ex. `npm version minor`) puis `npm run push` — le badge se met à jour seul.

## Structure `src/`

```
Serveur (.gs)
├── WebApp.gs        doGet() — point d'entrée (createTemplateFromFile().evaluate())
├── JsonParser.gs    extractJsonFields() — lecture, parsing, déballage des champs
├── SheetWriter.gs   convertJsonToSheet() — écriture dans Sheets par lots
├── DriveApi.gs      recherche (.json/.txt), recherche Sheets, resolveDriveFile() (URL/ID)
├── Version.gs       const APP_VERSION — GÉNÉRÉ depuis package.json (ne pas éditer)
└── appsscript.json  manifest GAS (webapp + scopes)

Client (.html, assemblés par HtmlService)
├── index.html         structure + en-tête + scriptlets d'assemblage
├── Styles.html        CSS (design SaaS + badge « gravé »)
├── App.html           contrôleur wizard + state + helpers UI partagés
├── DriveSearch.html   recherche Drive / résolution d'URL (étape 1)
├── LocalUpload.html   upload local (étape 1)
├── AnalyseJson.html   analyse JSON (transition 1→2)
├── FieldSelector.html sélection des champs (étape 2)
├── Destination.html   choix de destination (étape 3)
└── Progression.html   progression / résultat + initialisation

Outillage
└── scripts/inject-version.mjs   package.json → src/Version.gs (vMAJEUR.MINEUR)
```

## Workflow & conventions

Ce repo suit le **Simple AI Harness (taille S)** : les agents IA lisent `AGENTS.md` avant toute tâche, et le process est décrit dans `WORKFLOW.md`. Les specs des fonctionnalités vivent dans `backlog/`.

Le blueprint du harness est open source — **[simple-ai-harness-blueprint](https://github.com/GuiomeB/simple-ai-harness-blueprint)** 🚀
