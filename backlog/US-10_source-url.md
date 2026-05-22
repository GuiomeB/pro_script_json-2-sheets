# US-10 — Sélection de la source par URL Drive

**Épic :** v3.3 · **Taille :** M · **Dépend de :** —

## Contexte technique

Web App GAS v3 (`src/v3/`). À l'étape 1, l'utilisateur fournit le JSON source en **tapant un nom**
(recherche Drive débouncée) ou en **uploadant en local**. La v2 acceptait aussi une **URL Drive
complète ou un ID** (`ConfigService.extractDriveFileId`). On réintroduit cette 3e voie, frictionless,
dans le **même champ** de recherche source.

## User Story

> En tant qu'utilisateur,
> je veux coller l'URL complète (ou l'ID) d'un fichier dans le champ de recherche source,
> afin de sélectionner directement mon fichier sans avoir à le retrouver par son nom.

## Critères d'acceptance (Gherkin)

```gherkin
Scénario : Coller une URL Drive valide (happy path)
  Étant donné le champ de recherche source
  Quand je colle une URL Drive (…/d/<ID>/…) ou un ID brut d'un fichier accessible
  Alors le fichier est résolu et sélectionné comme source
  Et l'étape 2 se déverrouille et l'analyse des champs démarre

Scénario : URL/ID inaccessible ou invalide (sad path)
  Étant donné une URL ou un ID pointant vers un fichier inexistant ou sans droits
  Quand je le colle
  Alors un message non technique s'affiche
  Et aucune source n'est sélectionnée

Scénario : Recherche par nom préservée
  Étant donné que je tape un terme court (un nom de fichier)
  Quand la saisie n'est pas une URL/ID
  Alors la recherche par nom débouncée (300 ms) fonctionne comme avant
```

## Implémentation

- `DriveApi.gs` :
  - `_extractDriveFileId(input)` — réplique v2 : `/\/d\/([-\w]{25,})/` puis fallback `/[-\w]{25,}/`.
  - `resolveDriveFile(urlOrId)` — ouvre via `DriveApp.getFileById`, retourne `{ id, name }`, lève une erreur amicale sinon. Exposée à `google.script.run`.
- `DriveSearch.html` :
  - `_onInput` détecte une URL/ID via `_looksLikeDriveRef` (`drive.google.com`/`docs.google.com` ou segment 25+ caractères) → `_resolveUrl` ; sinon recherche débouncée.
  - `_resolveUrl` appelle `resolveDriveFile` puis réutilise `_select(file)` (flux existant : `App.state.source`, `unlockStep(2)`, `AnalyseJson.run`).
- `index.html` : libellé du champ → « Rechercher dans Google Drive (nom ou URL du fichier) ».

## Vérification

`npm run push` → `/dev` :
- coller l'URL d'un `.json`/`.txt` accessible → fichier sélectionné, étape 2 déverrouillée ;
- coller une URL/ID bidon → message d'erreur, pas de sélection ;
- taper un nom → recherche normale.
