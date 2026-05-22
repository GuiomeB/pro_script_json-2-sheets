# US-12 — Épuration du message de succès

**Épic :** v3.3 · **Taille :** S · **Dépend de :** —

## Contexte technique

Web App GAS v3 (`src/`). L'écran de fin de conversion (`Progression.showSuccess`) affiche une
carte verte avec « ✅ Votre fichier est prêt ! » au-dessus du bouton « Ouvrir le fichier → ».

## User Story

> En tant qu'utilisateur,
> je veux un écran de succès épuré,
> afin d'accéder au fichier sans message superflu.

## Critères d'acceptance (Gherkin)

```gherkin
Scénario : Succès épuré (happy path)
  Étant donné une conversion qui réussit
  Quand l'écran de succès s'affiche
  Alors l'emoji ✅ et le texte « Votre fichier est prêt ! » ne sont plus présents
  Et le bouton vert « Ouvrir le fichier → » reste affiché
  Et cliquer dessus ouvre le fichier Sheets dans un nouvel onglet
```

## Implémentation

- `src/Progression.html` (`showSuccess`) : retirer le `<p>✅ Votre fichier est prêt !</p>`,
  conserver le bouton `#btn-open`.
- `src/Styles.html` : retirer la règle `.result-card.success p` devenue inutile.

## Vérification

`npm run push` → URL `/dev` → lancer une conversion → l'écran de succès ne contient que le bouton vert.
