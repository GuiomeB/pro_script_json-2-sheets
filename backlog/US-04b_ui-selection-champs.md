# US-04b — UI sélection des champs

## User Story

En tant qu'utilisateur,
je veux voir la liste des champs disponibles dans mon JSON et pouvoir choisir ceux à conserver,
afin de contrôler quelles colonnes apparaîtront dans mon tableau final.

**Taille :** S
**Dépend de :** US-04a
**Bloque :** US-05, US-06

---

## Contexte technique

| Élément | Détail |
|---|---|
| Rendu | Génération dynamique de `<input type="checkbox">` côté client à partir du tableau retourné par US-04a |
| État par défaut | Tous les champs cochés (opt-out, pas opt-in) |
| Données conservées | Tableau des champs sélectionnés, accessible pour US-05 / US-06 / US-07 |
| Validation | Au moins 1 champ coché requis pour passer à l'étape 3 |
| Compteur | Indicateur dynamique "X champs sélectionnés sur Y" mis à jour à chaque changement |

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Sélection des champs à inclure dans le tableau

  Scénario: Affichage de la liste après analyse réussie
    Étant donné que l'analyse JSON a retourné une liste de champs
    Quand l'étape 2 se déverrouille
    Alors chaque champ apparaît dans une liste avec une case à cocher
    Et toutes les cases sont cochées par défaut
    Et un indicateur affiche "X champs sélectionnés sur X"

  Scénario: Décocher un champ
    Étant donné que tous les champs sont affichés
    Quand je décoche le champ "adresse"
    Alors la case "adresse" se décoche
    Et le compteur se met à jour : "X-1 champs sélectionnés sur X"
    Et le bouton "Continuer" reste actif

  Scénario: Tout décocher — blocage de la progression
    Étant donné que tous les champs sont affichés
    Quand je décoche tous les champs un par un
    Alors le compteur affiche "0 champs sélectionnés sur X"
    Et le bouton "Continuer vers Destination" se désactive
    Et un message s'affiche : "Sélectionnez au moins un champ pour continuer."

  Scénario: Validation et passage à l'étape 3
    Étant donné qu'au moins un champ est coché
    Quand je clique sur "Continuer vers Destination"
    Alors l'étape 3 "Destination" se déverrouille
    Et la liste des champs sélectionnés est conservée en mémoire
```

---

## Critères d'acceptance

- [ ] La liste des champs s'affiche dynamiquement à partir du résultat de US-04a
- [ ] Toutes les cases sont cochées par défaut
- [ ] Le compteur "X sur Y" se met à jour en temps réel
- [ ] Il est impossible de passer à l'étape 3 avec 0 champ sélectionné
- [ ] Le message de blocage est clair et non technique
- [ ] La sélection est conservée en mémoire pour être utilisée lors de la conversion (US-07)

---

## Définition of Done

- [ ] Liste de checkboxes générée dynamiquement depuis le tableau `string[]`
- [ ] Toutes cochées par défaut au rendu
- [ ] Compteur dynamique implémenté
- [ ] Bouton "Continuer" désactivé si 0 sélection
- [ ] Tableau des champs sélectionnés accessible pour les étapes suivantes
- [ ] Testé : sélection partielle, tout coché, tout décoché, un seul coché
