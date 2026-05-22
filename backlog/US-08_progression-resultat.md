# US-08 — Progression et résultat

## User Story

En tant qu'utilisateur,
je veux voir l'avancement de la conversion et accéder directement au fichier créé,
afin de savoir que tout s'est bien passé et de commencer à utiliser mon tableau immédiatement.

**Taille :** S
**Dépend de :** US-07
**Bloque :** aucune (US terminale)

---

## Contexte technique

| Élément | Détail |
|---|---|
| Modèle d'exécution | `google.script.run` est asynchrone mais sans streaming — pas de mise à jour intermédiaire possible depuis GAS |
| Indicateur pendant la conversion | Spinner animé (CSS) + message "Conversion en cours…" — affiché pendant toute la durée de l'appel |
| Résultat succès | `withSuccessHandler(url)` — affichage du bouton "Ouvrir le fichier" avec l'URL retournée par US-07 |
| Résultat erreur | `withFailureHandler(error)` — affichage d'un message d'erreur non technique |
| Ouverture du fichier | `window.open(url, '_blank')` — ouvre le Sheets dans un nouvel onglet |

> **Limitation GAS :** Pas de barre de progression avec pourcentage réel en v3.0 (GAS ne supporte pas le streaming de données). Un spinner suffit pour signaler l'activité. Une vraie barre de progression (via polling ou Pub/Sub) est reportée à v3.x si besoin.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Retour visuel pendant et après la conversion

  Scénario: Conversion en cours
    Étant donné que j'ai cliqué sur "Convertir"
    Alors le bouton "Convertir" se désactive pour éviter un double-envoi
    Et un spinner animé s'affiche avec le message "Conversion en cours…"
    Et tous les champs de l'interface sont désactivés pendant ce temps

  Scénario: Conversion réussie
    Étant donné que la conversion s'est terminée sans erreur
    Alors le spinner disparaît
    Et un message de succès s'affiche : "Votre fichier est prêt !"
    Et un bouton "Ouvrir le fichier" s'affiche et ouvre le Sheets dans un nouvel onglet
    Et un lien secondaire permet de copier l'URL du fichier

  Scénario: Erreur pendant la conversion
    Étant donné qu'une erreur est survenue pendant la conversion
    Alors le spinner disparaît
    Et un message d'erreur non technique s'affiche (ex. "La conversion a échoué. Réessayez ou contactez le support.")
    Et un bouton "Recommencer" réinitialise la page à l'étape 1

  Scénario: Double-clic sur "Convertir"
    Étant donné que j'ai cliqué sur "Convertir"
    Quand je clique à nouveau sur "Convertir"
    Alors le second clic est ignoré (bouton désactivé)
    Et une seule conversion est lancée
```

---

## Critères d'acceptance

- [ ] Le bouton "Convertir" se désactive immédiatement après le premier clic
- [ ] Un indicateur animé est visible pendant toute la durée de la conversion
- [ ] En cas de succès : message de confirmation + bouton "Ouvrir le fichier" cliquable
- [ ] En cas d'erreur : message non technique + bouton "Recommencer"
- [ ] "Ouvrir le fichier" ouvre le Sheets dans un nouvel onglet (pas de redirection de la page courante)
- [ ] L'interface est réactivée après succès ou erreur

---

## Définition of Done

- [ ] Spinner CSS affiché au clic sur "Convertir"
- [ ] Bouton "Convertir" désactivé pendant l'exécution
- [ ] `withSuccessHandler` affiche le message succès + bouton avec URL
- [ ] `withFailureHandler` affiche un message d'erreur lisible + bouton "Recommencer"
- [ ] "Recommencer" recharge la page ou réinitialise le wizard à l'étape 1
- [ ] Testé : succès, erreur GAS simulée, double-clic
