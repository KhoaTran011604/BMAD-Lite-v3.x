# /bmad-scan - BMAD-Lite Brownfield Project Scanner

Invoke the Scanner agent to quickly scan an existing project's structure, tech stack, modules, and business domains — then generate BMad-Lite compatible documentation.

---

## Usage

```
/bmad-scan [action]
```

**Actions:**

| Action | Description |
|--------|-------------|
| (no action) | Full scan — all 7 sub-scans, show summary |
| `arch` | Scan architecture aspects only (config, tech, structure, models, routes) |
| `prd` | Scan business/PRD aspects only (config, modules, business, routes) |
| `gen-arch` | Generate Architecture docs from scan results (~10 files) |
| `gen-prd` | Generate PRD docs from scan results (~9+ files) |
| `gen-progress` | Generate Progress + module-graph (~3 files) |
| `gen-all` | Generate all docs at once (~22 files) |
| `quick` | Quick scan + generate all docs in one step (~22 files, minimal content) |
| `skeleton` | Generate empty BMad-Lite doc structure only |
| `report` | Full scan, show detailed report (no file writes) |

---

## Activation

Load and activate the Scanner agent:
1. Read `.bmad-lite/agents/scanner.md`
2. Follow activation instructions in the agent file
3. Load `.bmad-lite/config.yaml` for output settings

---

## Agent: Scanner

**Role:** Brownfield Project Scanner & Reconnaissance Specialist

**Key Principles:**
- **Speed over depth** — scan structure, not implementation
- **Config files are truth** — package.json, tsconfig tell the story
- **Names reveal intent** — folder/file names encode business logic
- **Non-destructive** — NEVER modify existing project files

---

## Quick Commands

After activation, use these commands with `*` prefix:

### Scanning
- `*scan` — Full scan (7 sub-scans: config, tech, structure, models, routes, modules, business)
- `*scan-arch` — Architecture scan (5 sub-scans: config, tech, structure, models, routes)
- `*scan-prd` — Business/PRD scan (4 sub-scans: config, modules, business, routes)

### Generate (run after scan)
- `*gen-arch` — Architecture docs (~10 files) — task: `.bmad-lite/tasks/gen-arch.md`
- `*gen-prd` — PRD docs (~9+ files) — task: `.bmad-lite/tasks/gen-prd.md`
- `*gen-progress` — Progress + module-graph (~3 files) — task: `.bmad-lite/tasks/gen-progress.md`
- `*gen-all` — All of the above at once
- `*generate-skeleton` — Empty doc structure only

### Utilities
- `*report` — Scan summary (no file writes)
- `*help` — Show all commands
- `*exit` — Exit scanner mode

---

## Output Files

| Command | Files | Target | Template Ref |
|---------|-------|--------|-------------|
| `*gen-arch` | ~10 | `docs/architecture/` | `architecture.yaml` |
| `*gen-prd` | ~9+ | `docs/prd/` | `prd.yaml` |
| `*gen-progress` | ~3 | `docs/module-graph.md` + `docs/progress/` | `progress.yaml` |

All generated files marked `[SCANNED — needs review]`.

---

## Typical Workflow

### Full Brownfield Onboarding

```
1. /bmad-scan              → Full scan (7 sub-scans)
2. *gen-arch               → Architecture docs (~10 files)
3. *gen-prd                → PRD docs (~9+ files)
4. *gen-progress           → Progress + module-graph (~3 files)
5. /bmad-plan prd          → Refine PRD
6. /bmad-plan arch         → Refine Architecture
7. /bmad-execute draft     → Start development
```

### Architecture Only

```
1. /bmad-scan arch         → Scan arch aspects (5 sub-scans)
2. *gen-arch               → Generate architecture docs
3. /bmad-plan arch         → Refine
```

### PRD / Business Only

```
1. /bmad-scan prd          → Scan business aspects (4 sub-scans)
2. *gen-prd                → Generate PRD docs
3. /bmad-plan prd          → Refine
```

### Quick Scan (fastest — one step, all docs)

```
/bmad-scan quick           → Lightweight scan + generate ~22 files (minimal content)
```

### Quick Check (no files)

```
/bmad-scan report          → Full scan summary, no file writes
```

---

## Example Session

```
User: /bmad-scan

Scanner: [1/7] config ✓  [2/7] tech ✓  [3/7] structure ✓  [4/7] models ✓
         [5/7] routes ✓  [6/7] modules ✓  [7/7] business ✓

=== SCAN COMPLETE ===

Project: my-crm | Fullstack (Next.js 16 + MongoDB)
Models (8) | Modules (7) | Endpoints (24) | Epics [INFERRED] (5)

Next:
  *gen-arch      → Architecture (10 files)
  *gen-prd       → PRD (9+ files)
  *gen-progress  → Progress (3 files)
  *gen-all       → All (~22 files)

User: *gen-arch
Scanner: ✓ 10 files → docs/architecture/

User: *gen-prd
Scanner: ✓ 9 files → docs/prd/

User: *gen-progress
Scanner: ✓ 3 files → docs/module-graph.md + docs/progress/
```
