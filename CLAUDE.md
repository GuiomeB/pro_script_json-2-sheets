# CLAUDE.md — JSON_2_Sheets

Agent adapter for Claude Code. `AGENTS.md` is canonical — this file only adds Claude-specific wiring.

## Init load order

Before generating code for any new request, load context in this order:
1. `AGENTS.md` (project contract — implicit, never skip)
2. Files directly touched by the request
3. Additional documentation only if the task obviously requires it

Never load large documents "just in case".

## Workflow reference

- Process and conventions: `WORKFLOW.md`
- Per-event learning: `.agents/workflows/learning-loop.md` (invoke with `/learn`)
