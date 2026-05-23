---
name: bmad-refactor
description: Invokes the refactoring workflow to keep planning and architectural documentation lean and focused by extracting detailed sections into external files.
---

# /bmad-refactor - BMAD-Lite Document Refactoring

Use this skill when documentation files (PRD and Architecture) grow too large and verbose. It analyzes document sizes, plans extractions, and structures external specification files.

---

## When to Use This Skill
- When `docs/prd.md` exceeds ~200 lines (contains non-requirements or verbose descriptions).
- When `docs/architecture.md` exceeds ~300 lines (contains detailed schemas or configurations rather than design decisions).
- When you want to extract specific modules or API endpoint specifications to keep documentation clean.

---

## Usage Actions
Invoke the skill with `/bmad-refactor [target]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **`docs`** or **(no target)** | Analyze and plan refactoring candidate sections for all docs |
| **`prd`** | Target and refactor `docs/prd.md` only |
| **`arch`** | Target and refactor `docs/architecture.md` only |

---

## 📐 REFRACTORING STANDARD & TARGET SIZES

| Document | Target Limit | Content Structure | Extraction Candidates |
| :--- | :--- | :--- | :--- |
| **`prd.md`** | **~200 lines** | High-level goals, change log, functional & non-functional requirements, epic summary list | - Full user stories → `docs/epics/epic-{n}.md`<br>- UI wireframe logs → `docs/ui-logs/` |
| **`architecture.md`** | **~300 lines** | Architecture diagrams, patterns, core tech stack tables, decision entries | - DB tables & ERD → `docs/architecture/database-schema.md`<br>- Entity models → `docs/architecture/data-models.md`<br>- REST routes → `docs/architecture/rest-api-spec.md` |

---

## 🛠️ REFRACTORING STEP-BY-STEP PROCESS
1. **Analyze:** Check sizes of `docs/prd.md` and `docs/architecture.md`. Identify bloated sections.
2. **Draft Plan:** Map candidate sections to new or existing sharded files. Explain how heading levels will be adjusted.
3. **Present and Request Approval:** Show the user the candidates and target file paths. Do not write changes until the user gives explicit confirmation.
4. **Execute:** Extract content, rewrite targets, create target directories/files, and keep index files updated.
5. **Validate:** Verify all cross-references, file links, and indexes are valid.
6. **English Only:** All extracted documents and changelogs must be written in **English**.
