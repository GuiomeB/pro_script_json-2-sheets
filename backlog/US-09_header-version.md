# US-09 — En-tête + badge de version

**Épic :** v3.3 · **Taille :** M · **Dépend de :** —

## Contexte technique

Web App GAS v3 (`src/`). Le header avait été retiré en v3.1 (remplacé par un `<h1 class="sr-only">`).
`index.html` est rendu via `createTemplateFromFile('index').evaluate()` → les scriptlets `<?= … ?>`
sont évalués. clasp pousse les fichiers bruts (pas de build), d'où l'injection de version au push.

## User Story

> En tant qu'utilisateur,
> je veux voir le nom de l'app et sa version en haut de la page,
> afin d'identifier l'outil et de savoir quelle version j'utilise.

## Critères d'acceptance (Gherkin)

```gherkin
Scénario : Header et badge (happy path)
  Étant donné l'app ouverte
  Quand la page se charge
  Alors un en-tête centré affiche « Json 2 Sheets »
  Et un badge « v3.3 » apparaît dans l'angle supérieur droit
  Et le badge a un effet gravé (ombres internes)

Scénario : Corrélation automatique de la version
  Étant donné que la version de package.json change
  Quand on exécute `npm run push`
  Alors le badge reflète la nouvelle version « vMAJEUR.MINEUR »
  Sans aucune édition manuelle du HTML
```

## Implémentation

- `package.json` : version `3.2.0` → `3.3.0` ; script `"push": "node scripts/inject-version.mjs && clasp push -f"`.
- `scripts/inject-version.mjs` : lit `package.json`, dérive `v{major}.{minor}`, génère `src/Version.gs` (`const APP_VERSION`).
- `src/Version.gs` : généré (committé, régénéré à chaque push).
- `index.html` : `<header class="app-header">` avec `<h1 class="app-title">Json 2 Sheets</h1>` + `<span class="version-badge"><?= APP_VERSION ?></span>` (remplace le `sr-only`) ; `<title>` → « Json 2 Sheets ».
- `Styles.html` : `.app-header` (centré, relatif), `.version-badge` (absolu top-right, petit, `box-shadow: inset …` + `text-shadow` pour l'effet gravé).
- `WebApp.gs` : `setTitle('Json 2 Sheets')` (cohérence onglet).

## Vérification

`npm run push` → `/dev` : header centré « Json 2 Sheets » + badge « v3.3 » gravé en haut à droite.
Bumper `package.json` (ex. 3.4.0) → re-push → le badge affiche « v3.4 » sans toucher au HTML.
