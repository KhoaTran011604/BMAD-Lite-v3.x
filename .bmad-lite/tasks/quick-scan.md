# Quick Scan Task

One-step lightweight scan + generate ALL BMAD-Lite docs with minimal content.
Referenced from `.bmad-lite/agents/scanner.md`.

---

## Philosophy

- **Speed > completeness** — get the structure in place, refine later
- **One step** — no separate scan/gen phases, do it all at once
- **Minimal reads** — only `package.json`, config files, folder tree (depth 2), README/CLAUDE.md
- **No code reading** — never open .ts/.js files for content
- **All files generated** — complete BMAD-Lite skeleton with summarized content

---

## Scan Phase (ultra-light)

Read ONLY these files (parallel where possible):

1. `package.json` — name, description, dependencies keys (names + versions only)
2. `README.md` / `CLAUDE.md` — project description (first 50 lines max)
3. Top-level file listing — `ls` root
4. `src/` folder tree — depth 2 only (folder names, not file contents)
5. Config files — `tsconfig.json`, `next.config.*`, `tailwind.config.*` (top-level keys only)
6. Route folder listing — `src/app/api/` folder names (depth 1) for endpoint groups
7. Model folder listing — `src/lib/models/` or `src/models/` file names only

**DO NOT read:** any .ts/.js file contents, test files, style files, node_modules, .git

---

## Extract Phase (from scan data)

From the minimal reads above, extract:

| Data | Source | Depth |
|------|--------|-------|
| Project name + description | package.json, README | Direct |
| Tech stack | package.json dependencies | Name + version only |
| Folder structure | `src/` depth 2 | Folder names only |
| API domains | `src/app/api/` subfolders | Folder names → domain names |
| Model names | model file names | File name → entity name |
| UI framework | dependencies (tailwind, shadcn, etc.) | Name only |
| Auth method | dependencies (jose, next-auth, etc.) | Name only |
| User roles | CLAUDE.md or README mentions | If available |
| Epics | 1 epic per API domain group | Title only |

---

## Generate Phase (all files, minimal content)

Generate ALL ~22 files. Every file:
- Tagged `[QUICK-SCAN]` instead of `[SCANNED]`
- Max 30 lines per file (aim for 10-20)
- Tables with 1-line headers + data rows, no verbose descriptions
- Use `[TODO]` for anything that needs manual input

### Architecture files (`docs/architecture/`)

| File | Content |
|------|---------|
| `index.md` | TOC with links (5 lines) |
| `tech-stack.md` | Dependency table: Category, Name, Version (no Rationale column) |
| `source-tree.md` | Tree-character format (`├──`, `│`, `└──`) in fenced code block, inline `# annotations`, depth 2-3. Ref: `docs/architecture/source-tree.md` |
| `source-tree.json` | Nested JSON object with `_files` arrays per folder. Large folders (>6 files): use `[QUICK-SCAN] ~N {type} files`. Small/core folders: list actual file names. Ref: `docs/architecture/source-tree.json` |
| `data-models.md` | Table: Model name, File path (no field details) |
| `rest-api-spec.md` | Table: Domain, Base path (no individual endpoints) |
| `coding-standards.md` | 3-5 bullet points from tsconfig/eslint presence |
| `database-schema.md` | Table: Collection name, Model file (no field details) |
| `security.md` | Auth method + roles list (if found) |
| `components.md` | Component folder names only |

### PRD files (`docs/prd/`)

| File | Content |
|------|---------|
| `index.md` | TOC with links |
| `goals-and-background-context.md` | 2-3 sentences from README/package.json |
| `requirements.md` | 1 FR per API domain, 2-3 NFRs from config |
| `epic-list.md` | Table: Epic #, Title, Goal (1 line each) |
| `epic-{n}-{slug}.md` | Epic title + 2-3 story titles (no Gherkin, no AC) |
| `user-interface-design-goals.md` | UI framework + page folder names |
| `technical-assumptions.md` | 5 bullet points from config |

### Module Graph (`docs/`)

**Template:** `.bmad-lite/templates/module-graph.yaml`

| File | Content |
|------|---------|
| `module-graph.md` | Mermaid `graph TB` with 1 subgraph per domain + Module Details tables (Module, Key Files, Related Stories). Generated AFTER architecture files. Stories = `[TODO]`. |

### Progress files (`docs/progress/`)

| File | Content |
|------|---------|
| `progress/index.md` | Epic count + story count summary |
| `progress/changelog.md` | Single entry: "Quick-scan initial bootstrap" |

---

## Output Summary

After generating all files, display:

```
=== QUICK-SCAN COMPLETE ===

Project: {name} | {type} ({framework} + {db})
Files generated: {N} files across docs/

Architecture:  docs/architecture/ ({N} files) + docs/module-graph.md
PRD:           docs/prd/ ({N} files)  
Progress:      docs/progress/ ({N} files)

All files tagged [QUICK-SCAN] — refine with:
  /bmad-plan arch    → Expand architecture docs
  /bmad-plan prd     → Expand PRD docs
  /bmad-scan         → Full deep scan to replace quick-scan content
```

---

## Key Differences from Full Scan

| Aspect | Full Scan | Quick Scan |
|--------|-----------|------------|
| Steps | Scan → then Gen (separate) | One step |
| Reads | 7 sub-scans, model fields, route methods | Config + folder names only |
| Model detail | Field names + types | File names only |
| Route detail | HTTP methods + paths | Domain groups only |
| Epic detail | Stories with user-story format | Titles only |
| File content | 50-200 lines each | 10-30 lines each |
| Tag | `[SCANNED]` | `[QUICK-SCAN]` |
| Time | ~2 min | ~30 sec |
