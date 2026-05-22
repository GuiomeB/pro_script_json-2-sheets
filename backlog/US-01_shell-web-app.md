# US-01 — Shell web app

## User Story

En tant qu'utilisateur de l'organisation Google Workspace,
je veux accéder à une page web via une URL partagée,
afin de lancer le processus de conversion sans ouvrir aucun fichier au préalable.

**Taille :** M
**Dépend de :** aucune (US fondatrice)
**Bloque :** US-02, US-03

---

## Contexte technique

| Élément | Détail |
|---|---|
| Runtime | Google Apps Script V8 |
| Point d'entrée serveur | Fonction `doGet(e)` — déclenchée à chaque visite de l'URL |
| Rendu HTML | `HtmlService.createHtmlOutputFromFile('index')` |
| Restriction d'accès | Déploiement web app : accès "Tous les membres de l'organisation" |
| Exécution | "En tant que : Utilisateur accédant à l'application" — chaque user agit sur son propre Drive |
| OAuth scopes requis | `drive`, `spreadsheets` (déclarés dans `appsscript.json`) |
| Communication client ↔ serveur | `google.script.run` (asynchrone, callbacks) |

> **Contrainte clé :** Le mode d'exécution "utilisateur accédant à l'application" est non-négociable — c'est ce qui garantit que les fichiers créés appartiennent à chaque utilisateur et non à l'administrateur du script.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Accès à la page web JSON_2_Sheets

  Scénario: Accès d'un utilisateur de l'organisation
    Étant donné que je suis connecté avec un compte Google de l'organisation
    Quand j'ouvre l'URL du web app
    Alors la page affiche le titre "JSON → Sheets"
    Et l'étape 1 "Source" est active et accessible
    Et les étapes 2 "Champs" et 3 "Destination" sont visibles mais verrouillées
    Et un message d'introduction court et non technique est affiché

  Scénario: Tentative d'accès avec un compte hors organisation
    Étant donné que je suis connecté avec un compte Google personnel (hors organisation)
    Quand j'ouvre l'URL du web app
    Alors la page affiche un message clair : "Cet outil est réservé aux membres de [organisation]"
    Et aucune fonctionnalité n'est accessible

  Scénario: Accès sans être connecté à Google
    Étant donné que je ne suis pas connecté à Google
    Quand j'ouvre l'URL du web app
    Alors Google me redirige automatiquement vers la page de connexion
    Et après connexion avec un compte de l'organisation la page s'affiche normalement
```

---

## Critères d'acceptance

- [ ] `doGet()` retourne un `HtmlOutput` valide sans erreur
- [ ] La page affiche 3 étapes visuellement distinctes avec leur état (active / verrouillée)
- [ ] Seule l'étape 1 est accessible au chargement
- [ ] Un utilisateur hors organisation reçoit un message d'erreur explicite, pas une page blanche
- [ ] La page est utilisable sur desktop et mobile (pas de débordement horizontal)
- [ ] Aucun jargon technique (ID, API, token, scope…) n'est visible par l'utilisateur

---

## Définition of Done

- [ ] `doGet()` implémentée, retourne l'HTML
- [ ] Fichier HTML (`index.html`) contient le squelette du wizard 3 étapes
- [ ] Déployé comme web app et testé manuellement avec un compte de l'organisation
- [ ] Accès refusé vérifié avec un compte hors organisation
- [ ] `appsscript.json` contient les scopes OAuth nécessaires
