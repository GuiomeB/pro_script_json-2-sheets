# US-02 — Source : Drive Search

## User Story

En tant qu'utilisateur,
je veux pouvoir rechercher un fichier JSON depuis mon Google Drive en tapant son nom,
afin de le sélectionner sans avoir à chercher et copier-coller une URL technique.

**Taille :** M
**Dépend de :** US-01
**Bloque :** US-04a (en tant que source alternative à US-03)

> **Décision produit :** Cette US implémente une recherche par nom de fichier (pas de Drive Picker natif).
> Le Drive Picker (navigation visuelle dans l'arborescence) est reporté en évolution v3.x — il requiert
> une clé API Google Cloud Platform supplémentaire.

---

## Contexte technique

| Élément | Détail |
|---|---|
| Recherche | `DriveApp.searchFiles('title contains "terme" and mimeType = "application/json"')` côté serveur |
| Appel | `google.script.run` avec le terme saisi par l'utilisateur |
| Résultats | Tableau `[{ id, name }]` retourné au client |
| Déclenchement | Recherche lancée après 300 ms d'inactivité dans le champ (debounce) ou sur appui Entrée |
| Retour attendu | ID du fichier Drive sélectionné par l'utilisateur dans la liste |
| Limite de résultats | 10 résultats max affichés (éviter les listes interminables) |

> **Contrainte :** `DriveApp.searchFiles()` ne cherche que dans les fichiers accessibles par l'utilisateur connecté (son Drive + partagés avec lui). Pas de clé API GCP requise.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Recherche d'un fichier JSON source depuis Google Drive

  Scénario: Recherche avec résultats
    Étant donné que je suis à l'étape 1 "Source"
    Quand je tape au moins 2 caractères dans le champ "Rechercher dans Drive"
    Alors une liste déroulante affiche les fichiers .json correspondants (10 max)
    Et chaque résultat affiche le nom du fichier
    Quand je clique sur un résultat
    Alors le nom du fichier sélectionné s'affiche dans l'étape 1
    Et l'étape 1 se marque comme complétée
    Et l'étape 2 "Champs" se déverrouille

  Scénario: Recherche sans résultat
    Étant donné que je tape un terme qui ne correspond à aucun fichier .json dans mon Drive
    Alors la liste affiche un message : "Aucun fichier JSON trouvé pour cette recherche."
    Et une suggestion invite à utiliser l'option "Depuis mon ordinateur"

  Scénario: Effacement du champ après sélection
    Étant donné qu'un fichier est déjà sélectionné
    Quand je modifie le contenu du champ de recherche
    Alors la sélection précédente est annulée
    Et l'étape 1 repasse en état initial jusqu'à une nouvelle sélection

  Scénario: Erreur d'accès Drive (quota GAS ou perte de session)
    Étant donné qu'une erreur survient lors de l'appel serveur
    Alors un message s'affiche : "Impossible d'accéder à votre Drive. Rechargez la page et réessayez."
    Et la liste ne s'affiche pas
```

---

## Critères d'acceptance

- [ ] Le champ de recherche est visible dans l'étape 1
- [ ] La recherche se déclenche à partir de 2 caractères saisis
- [ ] Les résultats sont filtrés sur les fichiers JSON uniquement
- [ ] Maximum 10 résultats affichés
- [ ] Un clic sur un résultat sélectionne le fichier et complète l'étape 1
- [ ] L'absence de résultat affiche un message utile (pas une liste vide silencieuse)
- [ ] Modifier le champ après sélection réinitialise la sélection
- [ ] L'ID du fichier est conservé en mémoire client pour US-04a

---

## Définition of Done

- [ ] Fonction serveur `searchDriveJsonFiles(term)` implémentée avec `DriveApp.searchFiles()`
- [ ] Retourne `[{ id, name }]`, max 10 résultats
- [ ] Debounce 300 ms côté client avant déclenchement de l'appel
- [ ] Liste déroulante de résultats avec sélection au clic
- [ ] Message explicite si aucun résultat
- [ ] Testé : résultats trouvés, aucun résultat, erreur serveur, modification après sélection
