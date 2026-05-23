# /bmad-refactor - BMAD-Lite Refactor Command

Restructure documentation to keep them lean and focused.

---

## Usage

```
/bmad-refactor [target]
```

**Targets:**
- `docs` or (no target) - Analyze and refactor all docs
- `prd` - Refactor PRD only
- `arch` - Refactor Architecture only

---

## What It Does

When PRD and Architecture grow too large, this command:

1. **Analyzes** document sizes and identifies bloated sections
2. **Plans** extractions to external files
3. **Executes** refactoring with your approval
4. **Validates** all references work correctly

---

## Refactoring Principles

### PRD Should Contain (What & Why)
- Goals & Background
- Functional Requirements (FR)
- Non-Functional Requirements (NFR)
- Epic List (titles + goals)
- Story statements + AC (summary)

### Architecture Should Contain (How - Decisions)
- High-level overview
- Tech Stack table (CRITICAL)
- Data Models (summary table)
- API Spec (endpoint list)
- Source Tree
- Coding Standards

### Extract to External Files
- Full data model schemas → `docs/architecture/data-models.md`
- Full API spec → `docs/architecture/api-spec.yaml`
- Component details → `docs/architecture/components.md`
- Security details → `docs/architecture/security.md`
- Epic details → `docs/epics/epic-{n}.md`

---

## Target Sizes

| Document | Target | Contains |
|----------|--------|----------|
| prd.md | ~200 lines | Requirements only |
| architecture.md | ~300 lines | Decisions only |
| External files | Unlimited | Full specifications |

---

## Example

```
User: /refactor docs

╔════════════════════════════════════════════════════════════╗
║              DOCUMENT REFACTOR ANALYSIS                    ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  docs/prd.md                                               ║
║  Current: 450 lines → Target: ~200 lines                   ║
║                                                            ║
║  Extraction candidates:                                    ║
║  • Epic Details (280 lines) → docs/epics/                  ║
║                                                            ║
║  docs/architecture.md                                      ║
║  Current: 680 lines → Target: ~300 lines                   ║
║                                                            ║
║  Extraction candidates:                                    ║
║  • Data Models (180 lines) → docs/architecture/data-models.md
║  • API Spec (150 lines) → docs/architecture/api-spec.yaml  ║
║                                                            ║
║  Proceed with refactor? (y/n)                              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Workflow Details

See `.bmad-lite/tasks/refactor-docs.md` for detailed workflow.

---

## Agent

This command invokes **@planner** agent with refactor-docs task.
