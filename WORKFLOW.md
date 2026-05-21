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

---

## Branching & commits

Follow the global git workflow (`~/.claude/rules/git-workflow.md`):
- Branch: `feature/[ID]-[description]` or `fix/[ID]-[description]`
- Commit format: `[type]: [short description]` (types: feat, fix, refactor, docs, test, chore)
- Keep commits atomic — one logical change per commit.

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
