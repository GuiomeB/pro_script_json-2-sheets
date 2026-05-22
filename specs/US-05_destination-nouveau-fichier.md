# US-05 — Destination : nouveau fichier Sheets

## User Story

En tant qu'utilisateur,
je veux créer un nouveau fichier Google Sheets qui recevra mes données,
afin d'obtenir un tableau propre sans modifier aucun fichier existant.

**Taille :** M
**Dépend de :** US-04b
**Bloque :** US-07

---

## Contexte technique

| Élément | Détail |
|---|---|
| Création | `SpreadsheetApp.create(nom)` — crée dans le Drive racine de l'utilisateur |
| Emplacement | "Mon Drive" (racine) par défaut — pas de sélection de dossier en v3.0 |
| Nommage par défaut | `Export JSON — [nom du fichier source]` (ex. `Export JSON — clients.json`) |
| Retour | ID et URL du Sheets créé, transmis à US-07 puis US-08 |
| Option sélectionnée par défaut | Ce mode est l'option par défaut dans l'étape 3 |

> **Contrainte :** `SpreadsheetApp.create()` crée toujours dans le Drive racine de l'utilisateur. Déplacer dans un sous-dossier nécessiterait `DriveApp`, reporté à v3.x.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Configuration de la destination "Nouveau fichier"

  Scénario: Destination par défaut avec nom pré-rempli
    Étant donné que je suis à l'étape 3 "Destination"
    Alors le mode "Nouveau fichier" est sélectionné par défaut
    Et le champ nom est pré-rempli avec "Export JSON — [nom du fichier source]"
    Et une note indique que le fichier sera créé dans "Mon Drive"

  Scénario: Personnalisation du nom du fichier
    Étant donné que le mode "Nouveau fichier" est sélectionné
    Quand je modifie le nom dans le champ prévu
    Alors le nom saisi sera utilisé lors de la création du fichier

  Scénario: Tentative de laisser le nom vide
    Étant donné que le mode "Nouveau fichier" est sélectionné
    Quand je vide le champ nom
    Alors le bouton "Convertir" se désactive
    Et un message s'affiche : "Donnez un nom à votre fichier pour continuer."

  Scénario: Nom trop long
    Étant donné que je saisis un nom de plus de 100 caractères
    Alors le champ est limité à 100 caractères (contrainte HTML)
    Et aucun message d'erreur supplémentaire n'est nécessaire
```

---

## Critères d'acceptance

- [ ] Le mode "Nouveau fichier" est sélectionné par défaut dans l'étape 3
- [ ] Le champ nom est pré-rempli avec un nom dérivé du fichier source
- [ ] Un nom vide bloque le bouton "Convertir"
- [ ] Une note précise que le fichier sera créé dans "Mon Drive"
- [ ] Le nom et le mode sont conservés en mémoire pour transmission à US-07

---

## Définition of Done

- [ ] UI : radio button "Nouveau fichier" sélectionné par défaut, champ nom éditable
- [ ] Pré-remplissage du nom à partir du nom du fichier source
- [ ] Validation : champ vide → bouton "Convertir" désactivé
- [ ] Nom + mode transmis au moteur de conversion (US-07)
- [ ] Testé : nom par défaut, nom personnalisé, champ vide
