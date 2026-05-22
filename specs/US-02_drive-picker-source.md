# US-02 — Source : Drive Picker

## User Story

En tant qu'utilisateur,
je veux pouvoir choisir un fichier JSON depuis mon Google Drive via un sélecteur natif Google,
afin de ne pas avoir à chercher et copier-coller une URL technique.

**Taille :** M
**Dépend de :** US-01
**Bloque :** US-04a (en tant que source alternative à US-03)

---

## Contexte technique

| Élément | Détail |
|---|---|
| API client | Google Picker API (JavaScript, chargée via `gapi`) |
| Token OAuth | Récupéré côté serveur via `ScriptApp.getOAuthToken()`, passé au client via `google.script.run` |
| Filtre MIME | `application/json` uniquement dans le picker |
| Résultat retourné | ID du fichier Drive (ex. `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`) |
| Durée de vie du token | ~1h — le token doit être rafraîchi si la session dure longtemps |

> **Contrainte :** La Google Picker API nécessite une clé API Google Cloud activée pour le projet GAS. Elle ne fonctionne pas avec uniquement le token OAuth.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Sélection du fichier JSON source depuis Google Drive

  Scénario: Sélection réussie d'un fichier JSON
    Étant donné que je suis à l'étape 1 "Source"
    Quand je clique sur "Choisir depuis Google Drive"
    Alors la fenêtre Drive Picker s'ouvre
    Et seuls les fichiers .json sont visibles et sélectionnables
    Quand je sélectionne un fichier JSON
    Alors la fenêtre se ferme automatiquement
    Et le nom du fichier sélectionné s'affiche dans l'étape 1
    Et l'étape 1 se marque comme complétée
    Et l'étape 2 "Champs" se déverrouille

  Scénario: Fermeture du picker sans sélection
    Étant donné que la fenêtre Drive Picker est ouverte
    Quand je ferme la fenêtre sans sélectionner de fichier
    Alors l'étape 1 reste dans son état initial sans message d'erreur

  Scénario: Drive ne contient aucun fichier JSON
    Étant donné que mon Drive ne contient aucun fichier .json
    Quand j'ouvre le picker
    Alors le picker s'affiche avec un état vide
    Et un message suggère d'utiliser l'option "Depuis mon ordinateur"

  Scénario: Échec de récupération du token OAuth
    Étant donné que la récupération du token côté serveur échoue
    Quand je clique sur "Choisir depuis Google Drive"
    Alors un message s'affiche : "Impossible d'accéder à votre Drive. Rechargez la page et réessayez."
    Et le picker ne s'ouvre pas
```

---

## Critères d'acceptance

- [ ] Le bouton "Choisir depuis Google Drive" est visible dans l'étape 1
- [ ] Le picker filtre exclusivement sur les fichiers JSON (MIME `application/json`)
- [ ] Après sélection, le nom du fichier est affiché dans l'UI
- [ ] L'ID du fichier est conservé en mémoire client pour transmission à US-04a
- [ ] Annuler le picker ne provoque aucun état erroné
- [ ] Toute erreur d'accès Drive affiche un message compréhensible (pas de stack trace)

---

## Définition of Done

- [ ] Picker API initialisée avec clé API + token OAuth
- [ ] Filtre MIME `.json` actif et vérifié
- [ ] Token récupéré depuis le serveur GAS via `google.script.run`
- [ ] Nom du fichier affiché après sélection
- [ ] ID du fichier accessible pour l'étape suivante
- [ ] Testé : sélection, annulation, Drive sans JSON, erreur réseau simulée
