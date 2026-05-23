---
name: bmad-scan
description: Invokes the Brownfield Project Scanner to scan the codebase structure, tech stack, routes, and modules of an existing project and generate BMAD-Lite compliant documentation.
---

# /bmad-scan - BMAD-Lite Brownfield Project Scanner

Use this skill to scan an existing project's structure, tech stack, modules, and business domains, then generate BMAD-Lite compatible documentation in the `docs/` folder.

---

## When to Use This Skill
- When starting with an existing project (brownfield onboarding) and you need to generate architecture, PRD, and progress documents.
- When you want to check for codebase structure or technical configurations.
- When generating architecture files or PRD files based on earlier scan outputs.

---

## Usage Actions
Invoke the skill with `/bmad-scan [action]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **(no action)** | Perform a full scan (7 sub-scans) and show a summary |
| **`arch`** | Scan architecture aspects only (config, tech, structure, models, routes) |
| **`prd`** | Scan business/PRD aspects only (config, modules, business, routes) |
| **`gen-arch`** | Generate Architecture docs from scan results (~10 files under `docs/architecture/`) |
| **`gen-prd`** | Generate PRD docs from scan results (~9+ files under `docs/prd/`) |
| **`gen-progress`**| Generate Progress index and module graph (~3 files) |
| **`gen-all`** | Generate all documentation files at once (~22 files) |
| **`quick`** | Fast quick-scan + generate all docs in a single lightweight step |
| **`skeleton`** | Generate empty BMAD-Lite skeleton structure only |
| **`report`** | Run a full scan and display a detailed report (without writing any files) |

---

## Step-by-Step Scan Instructions
1. **Load Scanner Personas:** Read `.bmad-lite/agents/scanner.md` for operating guidelines and `.bmad-lite/config.yaml` for project settings.
2. **Execute Scan:**
   - Scan package configurations, dependencies, folder structures, imports, data models, routes, and modules.
   - Run task-specific steps as specified in `.bmad-lite/tasks/scan-project.md`.
3. **Generate Docs:**
   - For `*gen-arch`, follow `.bmad-lite/tasks/gen-arch.md` and the template in `.bmad-lite/templates/architecture.yaml`.
   - For `*gen-prd`, follow `.bmad-lite/tasks/gen-prd.md` and the template in `.bmad-lite/templates/prd.yaml`.
   - Mark all generated files with `[SCANNED — needs review]` at the top.
4. **All Output Files MUST be written in English.**
