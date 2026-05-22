# US-03 — Source : Upload local

## User Story

En tant qu'utilisateur,
je veux pouvoir charger un fichier JSON depuis mon ordinateur,
afin de traiter des fichiers qui ne sont pas encore sur mon Drive.

**Taille :** S
**Dépend de :** US-01
**Bloque :** US-04a (en tant que source alternative à US-02)

---

## Contexte technique

| Élément | Détail |
|---|---|
| Mécanisme | `<input type="file" accept=".json">` côté HTML |
| Lecture | `FileReader.readAsText()` — API navigateur standard |
| Transmission | Contenu brut (string JSON) passé à `google.script.run` |
| Limite de taille | GAS `google.script.run` accepte des payloads jusqu'à ~50 MB — suffisant pour l'usage cible |

> **Note :** Contrairement à US-02, ici le contenu du fichier (pas son ID) est transmis au serveur. La validation du JSON se fait côté client avant envoi.

---

## Scénarios Gherkin

```gherkin
Fonctionnalité: Chargement d'un fichier JSON depuis l'ordinateur

  Scénario: Upload d'un fichier JSON valide
    Étant donné que je suis à l'étape 1 "Source"
    Quand je clique sur "Depuis mon ordinateur"
    Alors l'explorateur de fichiers du système s'ouvre
    Quand je sélectionne un fichier .json valide
    Alors le nom du fichier s'affiche dans l'étape 1
    Et l'étape 1 se marque comme complétée
    Et l'étape 2 "Champs" se déverrouille

  Scénario: Tentative d'upload d'un fichier non-JSON
    Étant donné que l'explorateur de fichiers est ouvert
    Quand je sélectionne un fichier .csv ou .xlsx
    Alors un message s'affiche : "Ce fichier n'est pas au format JSON. Veuillez choisir un fichier .json."
    Et l'étape 1 reste dans son état initial

  Scénario: Upload d'un fichier JSON syntaxiquement invalide
    Étant donné que je sélectionne un fichier avec l'extension .json
    Mais dont le contenu n'est pas du JSON valide
    Alors un message s'affiche : "Ce fichier ne semble pas être un JSON valide. Vérifiez son contenu."
    Et l'étape 1 reste dans son état initial

  Scénario: Upload d'un fichier vide
    Étant donné que je sélectionne un fichier .json vide (0 octet)
    Alors un message s'affiche : "Ce fichier est vide."
    Et l'étape 1 reste dans son état initial
```

---

## Critères d'acceptance

- [ ] Le bouton "Depuis mon ordinateur" ouvre le sélecteur de fichiers natif
- [ ] Seuls les fichiers `.json` sont acceptés (attribut `accept=".json"` + validation JS)
- [ ] Le contenu du fichier est validé comme JSON valide avant de passer à l'étape suivante
- [ ] Les fichiers vides sont rejetés avec un message explicite
- [ ] Le nom du fichier est affiché après chargement réussi
- [ ] Le contenu JSON est conservé en mémoire client pour transmission à US-04a

---

## Définition of Done

- [ ] `<input type="file">` avec filtre `.json` implémenté
- [ ] `FileReader` lit le contenu et valide via `JSON.parse()`
- [ ] Messages d'erreur affichés pour : mauvaise extension, JSON invalide, fichier vide
- [ ] Contenu JSON accessible pour l'étape suivante
- [ ] Testé : JSON valide, fichier CSV, JSON malformé, fichier vide
