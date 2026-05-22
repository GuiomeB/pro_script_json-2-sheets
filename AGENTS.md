# AGENTS.md — JSON_2_Sheets

## The 4 Karpathy Rules (override everything else in conflict)

1. **Don't assume. Don't hide confusion. Surface trade-offs.** Ambiguity → ask before coding.
2. **Minimal code that solves the problem. Nothing speculative.** No preventive abstractions.
3. **Touch only what's necessary. Clean up only your own traces.** Diff = scope of the ticket.
4. **Define success criteria. Loop until verified.** State the verifiable criterion before acting.

---

## Project

**JSON_2_Sheets** — Extrait les données d'un fichier JSON Google Drive et les écrit dans un onglet Sheets, à partir de chemins JSON définis en ligne 1.

Stack: Google Apps Script (V8 runtime), déployé directement dans un Google Spreadsheet

### Arborescence

```
backlog/    → BACKLOG_v3.md + specs US (US-NN_*.md)
src/        → code source
src/v3/     → Web App GAS (voir conventions v3 ci-dessous)
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
| Déployer / tester | Copier les `.gs` dans l'éditeur Apps Script du spreadsheet cible |
| Lint local | `<lint command>` — aucun outil local configuré à ce stade |
| Tests | Aucun framework de test configuré — validation manuelle dans le spreadsheet |

---

## GAS Web App — conventions v3 (`src/v3/`)

### Structure de fichiers

| Fichier | Rôle | Règle |
|---|---|---|
| `WebApp.gs` | `doGet()` uniquement — point d'entrée | < 15 lignes, aucune logique métier |
| `*.gs` | Un fichier par domaine métier | `JsonParser.gs`, `SheetWriter.gs`, `DriveSearch.gs` |
| `index.html` | Structure HTML + scriptlets d'assemblage | Aucun CSS ni JS inline |
| `Styles.html` | `<style>` uniquement | Pas de DOCTYPE |
| `App.html` | Objet `App` global (state + helpers UI partagés) | |
| `*.html` | Un fragment par module JS | PascalCase = nom de l'objet JS dedans |

### Règles d'assemblage

- Un fragment = `<script>` ou `<style>` nu, sans DOCTYPE
- Inclus via `<?!= HtmlService.createHtmlOutputFromFile('X').getContent(); ?>`
- Les appels `.init()` vont dans le **dernier** fragment (`Progression.html`) — tous les objets JS sont définis avant

### Règles de conception

- **Symétrie API** : toute fonction `lockX()` doit avoir son inverse `unlockX()` (et vice versa)
- **Helpers UI partagés** : `renderSearchResults`, `setSpinner`, `hideSearchDropdown`, `showSearchMessage` vivent sur `App` — ne pas les dupliquer par module

---

## Critical zones

| Zone | Pourquoi critique | Règle |
|---|---|---|
| `ExtractionLogger._getOrCreateLogSheet()` | Crée/modifie un onglet permanent du spreadsheet | Vérifier que le nom `Logs` n'entre pas en conflit avec un onglet existant avant de modifier |
| `SheetWriter.clearPreviousData()` | Efface les données utilisateur à partir de la ligne 2 | Ne modifier la logique de nettoyage qu'avec un test sur un spreadsheet de dev |
| `JsonPathResolver.normalizeValue()` | Régit la conversion des valeurs — notamment dates ISO → Date | Tout changement doit être vérifié sur les 3 types : string, ISO date, objet imbriqué |
| `SheetWriter._sheetResolveTabName` | Renomme un onglet existant avec suffixe `_2`, `_3`… | Tester sur un Sheets avec des onglets déjà nommés `Export_*` |
| `SheetWriter._sheetWriteBatches` | Écrit par batches de 1000 lignes via `setValues` | Ne pas modifier la taille de batch sans tester sur un JSON > 5 000 lignes |

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
