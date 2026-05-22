# AGENTS.md — JSON_2_Sheets

## The 4 Karpathy Rules (override everything else in conflict)

1. **Don't assume. Don't hide confusion. Surface trade-offs.** Ambiguity → ask before coding.
2. **Minimal code that solves the problem. Nothing speculative.** No preventive abstractions.
3. **Touch only what's necessary. Clean up only your own traces.** Diff = scope of the ticket.
4. **Define success criteria. Loop until verified.** State the verifiable criterion before acting.

---

## Project

**JSON_2_Sheets** (« Json 2 Sheets ») — Web App Google Apps Script qui convertit un fichier JSON / `.txt` en tableau Google Sheets (wizard 3 étapes), déployée via clasp (`npm run push`).

Stack : Google Apps Script (V8 runtime).

### Arborescence

```
backlog/    → BACKLOG_v3.md + specs US (US-NN_*.md)
src/        → Web App GAS (code, voir conventions ci-dessous)
scripts/    → outillage (inject-version.mjs)
```

---

## Role

Before generating code for any new request, load context in this order:
1. `AGENTS.md` (this file — implicit, never skip)
2. Files directly touched by the request
3. Additional documentation only if the task obviously requires it

Never load large documents "just in case".

---

## Commands

| Purpose | Command |
|---|---|
| Déployer (Web App) | `npm run push` (clasp → `src/`). Voir README pour login/redeploy. |
| Lint local | `<lint command>` — aucun outil local configuré à ce stade |
| Tests | Aucun framework de test configuré — validation manuelle après `npm run push` |

---

## GAS Web App — conventions (`src/`)

### Structure de fichiers

| Fichier | Rôle | Règle |
|---|---|---|
| `WebApp.gs` | `doGet()` uniquement — point d'entrée | `createTemplateFromFile('index').evaluate()`, jamais `createHtmlOutputFromFile` |
| `*.gs` | Un fichier par domaine métier | `JsonParser.gs`, `SheetWriter.gs`, `DriveApi.gs` |
| `index.html` | Structure HTML + scriptlets d'assemblage | Aucun CSS ni JS inline |
| `Styles.html` | `<style>` uniquement | Pas de DOCTYPE |
| `App.html` | Objet `App` global (state + helpers UI partagés) | |
| `*.html` | Un fragment par module JS | PascalCase = nom de l'objet JS dedans |

> ⚠️ **Contrainte GAS** : deux fichiers ne peuvent pas partager le même nom, même avec des extensions différentes (`.gs` vs `.html`). Si un module JS client porte le même nom qu'un fichier `.gs`, renommer le `.gs` en ajoutant un suffixe sémantique (`DriveSearch.html` + `DriveApi.gs`).
>
> ⚠️ **Évaluation des scriptlets** : `doGet` doit servir la page via `HtmlService.createTemplateFromFile('index').evaluate()`. Avec `createHtmlOutputFromFile`, les `<?!= … ?>` ne sont **pas** évalués → la page rend du HTML nu (ni CSS ni JS injectés).

### Règles d'assemblage

- Un fragment = `<script>` ou `<style>` nu, sans DOCTYPE
- Inclus via `<?!= HtmlService.createHtmlOutputFromFile('X').getContent(); ?>`
- Les appels `.init()` vont dans le **dernier** fragment (`Progression.html`) — tous les objets JS sont définis avant

### Règles de conception

- **Symétrie API** : toute fonction `lockX()` doit avoir son inverse `unlockX()` (et vice versa)
- **Helpers UI partagés** : `renderSearchResults`, `setSpinner`, `hideSearchDropdown`, `showSearchMessage` vivent sur `App` — ne pas les dupliquer par module

### Gestion des données JSON

- **Enveloppe à clé unique** : `JsonParser._unwrapSingleKey()` descend dans les objets à une seule clé (`[{infosMagasin:{…}}]` → colonnes réelles). Appliqué **à l'identique** à l'extraction des champs ET aux données converties — sinon en-têtes et données se désalignent.
- **Recherche Drive des `.json`** : filtrer sur l'**extension `.json`** du nom, **pas** sur `mimeType = "application/json"`. Drive stocke fréquemment les `.json` en `text/plain`, invisibles au filtre MIME. (Le MIME natif des Google Sheets, lui, est fiable → la recherche Sheets garde son filtre MIME.)

---

## Critical zones

| Zone | Pourquoi critique | Règle |
|---|---|---|
| `JsonParser._unwrapSingleKey` | Définit quelles colonnes sont extraites (déballage des wrappers) | Toute modif doit être répercutée **à l'identique** dans `_extractKeys` ET `_getConvertData` |
| `SheetWriter._sheetResolveTabName` | Renomme un onglet existant avec suffixe `_2`, `_3`… | Tester sur un Sheets avec des onglets déjà nommés `Export_*` |
| `SheetWriter._sheetWriteBatches` | Écrit par batches de 1000 lignes via `setValues` | Ne pas modifier la taille de batch sans tester sur un JSON > 5 000 lignes ; gère les lignes non-objet |

---

## Risk rail (declare after every task)

After completing any task or before pushing/committing changes, declare a rail in your message:

- **Rail: green** — small/local; no critical zone touched; safe to merge fast
- **Rail: amber** — behavioural or transverse; the user should scan the diff
- **Rail: red** — critical path or production risk; the user must review

The rail is informational at this stage (no CI enforcement). Its value is forcing the agent to self-assess sensitivity, and the user to see it.

---

## Promote to M when

- Two or more agents active, OR friction "agent forgot rule X" recurs, OR 2+ critical zones identified, OR the project goes public with real users.
