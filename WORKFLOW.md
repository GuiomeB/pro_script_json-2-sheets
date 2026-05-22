# WORKFLOW.md — JSON_2_Sheets

## Development process

### Starting a task
1. Read `AGENTS.md` — confirm which critical zones may be touched.
2. State the verifiable success criterion before writing any code (Karpathy rule 4).
3. Scope the diff to the minimum needed (Karpathy rule 3).

### During a task
- Surface ambiguity immediately — do not infer and proceed silently (Karpathy rule 1).
- No speculative abstractions, helper functions, or "future-proofing" (Karpathy rule 2).

### Finishing a task
1. Verify against the success criterion stated at the start.
2. Declare the risk rail in your closing message (`Rail: green / amber / red`).
3. If something was hard, unexpected, or slowed you down → run `/learn` (see below).

### Code review (avant merge)

Lancer `/review` pour une revue en 3 agents parallèles :
- **Agent 1 — réutilisation** : cherche le code existant qui pourrait remplacer le nouveau ; flag les doublons
- **Agent 2 — qualité** : état redondant, copy-paste, abstractions fuyantes, commentaires inutiles, wrappers triviaux
- **Agent 3 — efficacité** : travail inutile, N+1, fuites mémoire, listeners accumulés, opérations trop larges

---

## Branching & commits

Follow the global git workflow (`~/.claude/rules/git-workflow.md`):
- Branch: `feature/[ID]-[description]` or `fix/[ID]-[description]`
- Commit format: `[type]: [short description]` (types: feat, fix, refactor, docs, test, chore)
- Keep commits atomic — one logical change per commit.

---

## Déploiement (Web App)

Le code `src/` est synchronisé avec Apps Script via clasp — plus de copier-coller manuel.

1. **Une seule fois** : `npm install` puis `npm run login` (OAuth Google, compte propriétaire du script)
2. **À chaque changement** : `npm run push` (envoie `src/` vers le projet GAS)
3. **Tester** : ouvrir l'URL `/dev` du script — reflète le HEAD immédiatement, pas de redéploiement
4. **Publier** sur l'URL `/exec` partagée : `npm run deployments` puis `npm run redeploy -- <deploymentId>`

`.clasp.json` (scriptId + rootDir) est versionné ; seul `~/.clasprc.json` (jetons OAuth) reste secret.
La validation des tâches se fait après `npm run push` (aucun framework de test automatisé).

---

## Coding standards

Follow the global standards (`~/.claude/rules/coding-standards.md`):
- Files < 300 lines, functions < 50 lines
- One function = one responsibility
- No secrets hardcoded — use env vars or config files
- Comments explain WHY, not WHAT

---

## When to invoke /learn

Run `/learn` after:
- A release or meaningful milestone
- An incident or unexpected breakage
- Repeated friction with the same tool or pattern
- A significant refactor
- A candidate decision (choosing between approaches)

See `.agents/workflows/learning-loop.md` for the exact format.

---

## Promote the harness (AGENTS.md bottom section)

When the promotion criterion at the bottom of `AGENTS.md` is met, run the
`simple-ai-harness-blueprint` skill again targeting this repo to upgrade to size M.
