# US-04a — Analyse JSON

## User Story

En tant qu'utilisateur,
je veux que le système lise automatiquement mon fichier JSON après sa sélection,
afin que je n'aie pas à comprendre sa structure moi-même.

**Taille :** S
**Dépend de :** US-02 OU US-03
**Bloque :** US-04b

---

## Contexte technique

| Élément | Détail |
|---|---|
| Exécution | Côté serveur GAS (fonction appelée via `google.script.run`) |
| Source Drive | Lecture via `DriveApp.getFileById(id).getBlob().getDataAsString()` |
| Source locale | Contenu JSON (string) déjà disponible côté client — transmis directement |
| Parsing | `JSON.parse()` + extraction des clés de premier niveau |
| Entrée d'un tableau | Si le JSON est un tableau `[{...}, {...}]`, les clés sont extraites du premier élément |
| Entrée d'un objet | Si le JSON est un objet `{...}`, les clés de premier niveau sont retournées directement |
| Retour | Tableau de strings : noms des branches (ex. `["nom", "adresse", "commandes"]`) |

> **Règle d'extraction :** uniquement les clés de profondeur 1. Les sous-objets et tableaux imbriqués apparaissent comme une seule branche (ex. `"adresse"` et non `"adresse.ville"`). La décomposition en sous-champs est reportée à v3.x.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Analyse automatique de la structure JSON

  Scénario: JSON valide sous forme de tableau d'objets
    Étant donné que l'utilisateur a fourni un fichier JSON contenant un tableau d'objets
    Quand l'analyse se déclenche automatiquement
    Alors les clés de premier niveau du premier objet sont extraites
    Et retournées sous forme de liste ordonnée alphabétiquement

  Scénario: JSON valide sous forme d'objet simple
    Étant donné que l'utilisateur a fourni un fichier JSON contenant un objet unique
    Quand l'analyse se déclenche
    Alors les clés de premier niveau de cet objet sont extraites et retournées

  Scénario: JSON valide mais tableau vide
    Étant donné que le fichier JSON est un tableau vide []
    Quand l'analyse se déclenche
    Alors un message s'affiche : "Ce fichier JSON ne contient aucune donnée à extraire."
    Et l'étape 2 ne se déverrouille pas

  Scénario: Fichier JSON inaccessible sur Drive
    Étant donné que l'ID Drive fourni correspond à un fichier que l'utilisateur ne peut plus lire
    Quand l'analyse tente de lire le fichier
    Alors un message s'affiche : "Impossible de lire ce fichier. Vérifiez qu'il est bien partagé avec vous."
    Et l'étape 2 ne se déverrouille pas

  Scénario: Erreur réseau ou timeout GAS
    Étant donné que l'appel serveur échoue (réseau, quota GAS)
    Quand l'analyse est déclenchée
    Alors un message s'affiche : "Une erreur est survenue lors de la lecture du fichier. Réessayez."
```

---

## Critères d'acceptance

- [ ] L'analyse se déclenche sans action de l'utilisateur dès que la source est disponible
- [ ] Fonctionne avec un JSON tableau ET un JSON objet
- [ ] Seules les clés de niveau 1 sont retournées (pas de dot-notation)
- [ ] Un tableau vide ou un objet sans clé déclenche un message d'erreur explicite
- [ ] Les erreurs d'accès Drive sont capturées et communiquées lisiblement
- [ ] Le résultat est transmis au client pour affichage dans US-04b

---

## Définition of Done

- [ ] Fonction serveur `extractJsonFields(sourceType, sourceData)` implémentée
- [ ] Gère les deux types de source : ID Drive et contenu string
- [ ] Retourne `string[]` des clés de premier niveau
- [ ] Erreurs catchées et retournées via `withFailureHandler`
- [ ] Testé sur : tableau d'objets, objet simple, tableau vide, fichier Drive inaccessible
