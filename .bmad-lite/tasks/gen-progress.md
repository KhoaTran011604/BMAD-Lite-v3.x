# Generate Progress & Module Graph Task

Generate Progress tracker and Module Graph from scan results.
Referenced from `.bmad-lite/agents/scanner.md`.

---

## Prerequisites

- `*scan` (or both `*scan-arch` + `*scan-prd`) must be completed first
- Scan data available: modules, business (epics), routes, models

## Template

Uses `.bmad-lite/templates/progress.yaml` for output structure and format.

## Output Files

```
docs/
  module-graph.md                 # [SCANNED] ONLY if not already created by *gen-arch
  progress/
    index.md                      # [SCANNED] initial tracker with epic counts
    changelog.md                  # [SCANNED] initial changelog entry
```

## Generation Rules

### module-graph.md (CONDITIONAL — skip if exists)

> **PRIMARY OWNER:** `*gen-arch` (via `.bmad-lite/templates/module-graph.yaml`)
>
> `*gen-progress` generates module-graph ONLY if `docs/module-graph.md` does not already exist.
> If it exists (created by `*gen-arch`), skip this step and log: "module-graph.md already exists — skipping."

**If generating:** Follow `.bmad-lite/templates/module-graph.yaml` structure:
- Mermaid `graph TB` with subgraphs per domain
- Module Details tables per domain (Module, Key Files, Related Stories)
- Shared/Cross-cutting table
- "How to Use This Graph" guide
- Stories = `[TODO]` (populated later by Planner or Reviewer)

### progress/index.md (from scan-business epic counts)

Follow template `progress.yaml` → `progress_index` section:

```markdown
# Project Progress

> [SCANNED] Auto-generated from project scan

## Summary

| Metric | Value |
|--------|-------|
| Total Epics | {N} [SCANNED] |
| Total Stories | {N} [SCANNED] |
| Completed | 0 |
| In Progress | 0 |
| Remaining | {N} |

## Epic Progress

| # | Epic | Stories | Done | Status |
|---|------|---------|------|--------|
| 1 | {title} [INFERRED] | {N} | 0 | Not Started |

## Progress Files

- [Changelog](./changelog.md)

## Change Log

| Date | Description |
|------|-------------|
| {date} | [SCANNED] Initial progress tracker |
```

### progress/changelog.md

Follow template `progress.yaml` → `changelog` section:

```markdown
# Changelog

## Activity Log

| Date | Action | Details |
|------|--------|---------|
| {date} | [SCANNED] Project scanned | Initial BMad-Lite docs generated |
```

## After Generation

- List all files with line counts
- Show total epic/story counts detected
