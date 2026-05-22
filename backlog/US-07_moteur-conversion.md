# US-07 — Moteur de conversion

## User Story

En tant qu'utilisateur,
je veux que mes données JSON soient écrites dans le fichier cible avec les champs sélectionnés en colonnes,
afin d'obtenir un tableau lisible et exploitable.

**Taille :** M
**Dépend de :** US-05 ET/OU US-06
**Bloque :** US-08

---

## Contexte technique

| Élément | Détail |
|---|---|
| Écriture | Réutilise la logique de `SheetWriter.gs` (v2) — écriture par lots via `setValues()` |
| Taille des lots | 1 000 lignes par appel (configurable) — évite les timeouts GAS |
| En-têtes | Ligne 1 = noms des champs sélectionnés (dans l'ordre de la sélection de US-04b) |
| Valeur d'une branche objet/tableau | `JSON.stringify(valeur)` — aplati en string lisible dans la cellule |
| Valeurs manquantes | Cellule vide si la clé est absente dans une entrée JSON |
| Entrée attendue | `{ sheetRef, fields: string[], data: object[] }` |
| Données source (Drive) | Relecture du fichier Drive depuis le serveur (ne pas re-transmettre depuis client) |
| Données source (local) | Contenu JSON déjà en mémoire client — re-transmis au serveur pour conversion |
| Retour | URL du fichier Sheets produit |

> **Réutilisation v2 :** La logique de `SheetWriter.gs` (batch writing, `clearPreviousData`) est adaptée, non réécrite. Seule la cible (`Sheet` reference) change par rapport à v2.

> **Zone critique héritée :** `SheetWriter.clearPreviousData()` — ne pas appeler dans ce mode (on écrit dans un onglet vierge, pas de nettoyage nécessaire).

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Conversion JSON vers tableau Sheets

  Scénario: Conversion réussie en mode "Nouveau fichier"
    Étant donné que l'utilisateur a sélectionné une source JSON, des champs et le mode "Nouveau fichier"
    Quand il clique sur "Convertir"
    Alors la ligne 1 du Sheets contient les noms des champs sélectionnés en en-têtes
    Et chaque entrée JSON correspond à une ligne du tableau
    Et les valeurs manquantes laissent la cellule vide
    Et les valeurs imbriquées (objets, tableaux) sont converties en texte JSON dans la cellule

  Scénario: Conversion réussie en mode "Ajouter un onglet"
    Étant donné que l'utilisateur a sélectionné le mode "Ajouter un onglet" avec un Sheets cible
    Quand la conversion se déroule
    Alors un nouvel onglet est créé dans le fichier cible
    Et les données y sont écrites sans modifier les onglets existants

  Scénario: JSON avec beaucoup d'entrées (> 1 000 lignes)
    Étant donné que le fichier JSON contient plus de 1 000 entrées
    Quand la conversion démarre
    Alors les données sont écrites par lots de 1 000 lignes
    Et toutes les lignes sont présentes dans le Sheets en fin de traitement

  Scénario: Timeout GAS en cours de conversion
    Étant donné qu'une conversion dépasse la limite d'exécution GAS (6 minutes)
    Quand le timeout survient
    Alors un message s'affiche : "La conversion a été interrompue. Le fichier a été partiellement créé."
    Et l'URL du fichier partiellement rempli est tout de même affichée si disponible

  Scénario: Erreur d'écriture dans le Sheets
    Étant donné qu'une erreur survient lors de l'écriture (quota, permissions perdues)
    Quand l'erreur est levée
    Alors un message non technique décrit le problème
    Et l'utilisateur est invité à réessayer
```

---

## Critères d'acceptance

- [ ] La ligne 1 contient exactement les champs sélectionnés dans US-04b, dans le même ordre
- [ ] Chaque entrée JSON devient une ligne (1 entrée = 1 ligne)
- [ ] Les clés absentes laissent la cellule vide (pas de crash)
- [ ] Les valeurs objet/tableau imbriquées sont converties via `JSON.stringify()`
- [ ] L'écriture par lots est active (≤ 1 000 lignes par appel `setValues`)
- [ ] Fonctionne pour les deux modes de destination (US-05 et US-06)
- [ ] `clearPreviousData()` de v2 n'est PAS appelée (onglet vierge dans tous les cas)
- [ ] L'URL du Sheets est retournée au client en fin de traitement

---

## Définition of Done

- [ ] Fonction `convertJsonToSheet({ sheetRef, fields, sourceType, sourceData })` implémentée
- [ ] En-têtes écrits en ligne 1
- [ ] Lignes écrites par lots de 1 000
- [ ] Valeurs manquantes gérées (pas d'exception)
- [ ] Valeurs imbriquées `JSON.stringify`-ées
- [ ] URL retournée via `withSuccessHandler`
- [ ] Testé sur : JSON simple, JSON avec valeurs manquantes, JSON imbriqué, JSON > 1 000 entrées
