# US-06 — Destination : ajouter un onglet

## User Story

En tant qu'utilisateur,
je veux ajouter les données extraites comme un nouvel onglet dans un fichier Sheets existant,
afin de conserver plusieurs extractions dans un même fichier sous forme d'historique.

**Taille :** M
**Dépend de :** US-04b
**Bloque :** US-07

---

## Contexte technique

| Élément | Détail |
|---|---|
| Sélection du Sheets cible | Google Picker API filtrée sur MIME `application/vnd.google-apps.spreadsheet` |
| Ouverture | `SpreadsheetApp.openById(id)` |
| Création de l'onglet | `spreadsheet.insertSheet(nomOnglet)` |
| Nommage par défaut | Horodatage : `Export_YYYY-MM-DD_HHhMM` (ex. `Export_2026-05-22_14h30`) |
| Conflit de nom | Si un onglet du même nom existe déjà, suffixer automatiquement avec `_2`, `_3`… |
| Retour | Référence à la nouvelle Sheet, transmise à US-07 |

> **Contrainte :** L'utilisateur doit avoir les droits d'édition sur le Sheets cible. Si ce n'est pas le cas, GAS lèvera une exception à capturer.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Ajout d'un onglet dans un fichier Sheets existant

  Scénario: Sélection d'un Sheets existant via le picker
    Étant donné que le mode "Ajouter un onglet" est sélectionné
    Quand je clique sur "Choisir un fichier Sheets"
    Alors le Drive Picker s'ouvre filtré sur les Google Sheets uniquement
    Quand je sélectionne un fichier Sheets
    Alors le nom du fichier sélectionné s'affiche
    Et le champ nom d'onglet est pré-rempli avec l'horodatage actuel

  Scénario: Personnalisation du nom d'onglet
    Étant donné qu'un Sheets cible est sélectionné
    Quand je modifie le champ nom d'onglet
    Alors le nom saisi sera utilisé pour le nouvel onglet

  Scénario: Nom d'onglet déjà existant dans le fichier
    Étant donné que je saisis un nom d'onglet qui existe déjà dans le Sheets cible
    Quand la conversion est lancée
    Alors l'onglet est créé avec le suffixe "_2" (ex. "MonExport_2")
    Et aucune donnée existante n'est modifiée

  Scénario: Aucun fichier Sheets sélectionné
    Étant donné que le mode "Ajouter un onglet" est sélectionné
    Mais qu'aucun fichier Sheets n'a été choisi
    Alors le bouton "Convertir" reste désactivé
    Et un message guide : "Choisissez d'abord un fichier Sheets existant."

  Scénario: Droits insuffisants sur le fichier cible
    Étant donné que l'utilisateur sélectionne un Sheets sur lequel il n'a que les droits de lecture
    Quand la conversion est lancée
    Alors un message s'affiche : "Vous n'avez pas les droits pour modifier ce fichier."
```

---

## Critères d'acceptance

- [ ] Le Drive Picker filtre sur les Google Sheets uniquement
- [ ] Le nom du fichier cible sélectionné s'affiche après sélection
- [ ] Le champ nom d'onglet est pré-rempli avec un horodatage
- [ ] Le nom d'onglet est modifiable
- [ ] Un conflit de nom est résolu automatiquement par suffixage
- [ ] Le bouton "Convertir" est désactivé si aucun fichier cible n'est sélectionné
- [ ] Les erreurs de droits sont capturées et affichées lisiblement

---

## Définition of Done

- [ ] Drive Picker configuré avec filtre `application/vnd.google-apps.spreadsheet`
- [ ] Champ nom d'onglet avec valeur par défaut horodatée
- [ ] Logique anti-conflit de nom implémentée côté serveur
- [ ] Erreurs de droits catchées et communiquées
- [ ] Référence à l'onglet créé transmise à US-07
- [ ] Testé : sélection, nom personnalisé, conflit de nom, droits insuffisants
