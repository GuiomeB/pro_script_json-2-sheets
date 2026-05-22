# US-11 — Support des fichiers .txt

**Épic :** v3.3 · **Taille :** S · **Dépend de :** —

## Contexte technique

Web App GAS v3 (`src/v3/`). La v3 n'accepte que les `.json` (upload local : `accept=".json"` +
validation `endsWith('.json')` ; recherche Drive : filtre `/\.json$/i`). La v2 acceptait des
exports JSON enregistrés en `.txt` (elle ne filtrait pas l'extension, lisait le contenu et
`JSON.parse`).

## User Story

> En tant qu'utilisateur,
> je veux fournir un fichier `.txt` contenant du JSON (comme en v2),
> afin de convertir aussi mes exports enregistrés en `.txt`.

## Critères d'acceptance (Gherkin)

```gherkin
Scénario : Upload local d'un .txt JSON (happy path)
  Étant donné l'option « Depuis mon ordinateur »
  Quand je choisis un fichier .txt dont le contenu est du JSON valide
  Alors le fichier est accepté et l'analyse des champs démarre

Scénario : Recherche Drive d'un .txt
  Étant donné le champ de recherche Drive
  Quand un fichier .txt correspond au terme saisi
  Alors il apparaît dans la liste des résultats

Scénario : .txt au contenu non-JSON (sad path)
  Étant donné un fichier .txt dont le contenu n'est pas du JSON
  Quand je le fournis
  Alors le message « JSON invalide » s'affiche et aucune source n'est sélectionnée
```

## Implémentation

- `index.html` : `accept=".json,.txt"` sur `#local-file-input` ; placeholder/aria du champ de recherche et du file input mentionnent `.json ou .txt`.
- `LocalUpload.html` (`_handleFile`) : validation `/\.(json|txt)$/i` au lieu de `endsWith('.json')` ; message d'erreur ajusté.
- `DriveApi.gs` (`searchDriveJsonFiles`) : filtre `/\.(json|txt)$/i`.
- `DriveSearch.html` : message « aucun résultat » mentionne `.json ou .txt`.
- `JsonParser.gs` : inchangé (lit déjà le contenu et `JSON.parse`, indépendamment de l'extension).

## Vérification

`npm run push` → `/dev` → uploader un `.txt` JSON (analysé) ; rechercher un `.txt` dans Drive (présent dans les résultats).
