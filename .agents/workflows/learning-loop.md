# /learn workflow

## Invocation

```
/learn <family> <slug>
```

Families: `release` | `candidate` | `incident` | `friction` | `refactor`

---

## Output format

File: `docs/learn/LEARN_<family>_<slug>_<YYYY-MM-DD>.md` (≤ 40 lines)

```markdown
# LEARN — <family> / <slug> — <YYYY-MM-DD>

## What helped
- <bullet>
- <bullet>

## What slowed us down
- <bullet>
- <bullet>

## ONE action retained
<imperative sentence, < 20 words>

Lands in: <AGENTS.md | WORKFLOW.md | .agents/context/<domain>.md>

## Diffusion
Files actually changed: <list>
```

**Hard constraint:** ONE action per `/learn`. If two lessons compete, run two separate `/learn` events.

---

## After writing the file

1. Update the "lands in" target artefact with the retained action.
2. Create `docs/learn/` if it doesn't exist yet.
3. Commit both files together: `docs: learn <family>/<slug>`.
