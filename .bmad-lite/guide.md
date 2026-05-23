# BMAD-Lite User Guide

**Version:** 2.0
**Last Updated:** 2026-02-05

Simplified AI-driven development workflow for building applications with Claude Code.

---

## Table of Contents

1. [What is BMAD-Lite?](#1-what-is-bmad-lite)
2. [Quick Start](#2-quick-start)
3. [The 3-Phase Workflow](#3-the-3-phase-workflow)
4. [Commands Reference](#4-commands-reference)
5. [Best Practices](#5-best-practices)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. What is BMAD-Lite?

A **structured workflow** for building applications with AI assistance.

### Core Concept

```
PLAN → EXECUTE → REVIEW → REPEAT
  ↓       ↓         ↓
 PRD    Code    Validated
 Arch   Tests   Features
```

### Key Benefits

| Without | With BMAD-Lite |
|---------|---------------|
| ❌ Ad-hoc AI conversations | ✅ Structured planning |
| ❌ Inconsistent code | ✅ Consistent standards |
| ❌ No clear requirements | ✅ Clear PRD + Architecture |
| ❌ Hard to track progress | ✅ Story-based tracking |

### Three Agents

- **🎯 Planner** - Creates PRD and Architecture
- **⚡ Executor** - Implements stories with code
- **🔍 Reviewer** - Validates quality (optional)

---

## 2. Quick Start

### Step 1: Create Planning Documents

```bash
# Create PRD (Product Requirements Document)
/bmad-plan prd

# Create Architecture (Technical Design)
/bmad-plan arch
```

**Output:**
- ✅ `docs/prd.md` - What to build
- ✅ `docs/architecture.md` - How to build

### Step 2: Build Stories

```bash
# Draft first story
/bmad-execute draft

# Implement it
/bmad-execute develop

# Validate completion
/bmad-execute done
```

**Output:**
- ✅ `docs/stories/1.1.md` - Story file
- ✅ `src/` - Working code
- ✅ Tests passing

### Step 3: Review (Optional)

```bash
# Review the story
/bmad-review story 1.1
```

**That's it!** Repeat Step 2 for each story.

---

## 3. The 3-Phase Workflow

### Phase 1: Planning (Do Once)

```
/bmad-plan prd  →  /bmad-plan arch  →  Ready to Build
     ↓                   ↓                    ↓
docs/prd.md      docs/architecture.md    All stories defined
```

**Creates:**
- Requirements and user stories
- Tech stack and coding standards
- File structure and patterns

### Phase 2: Execution (Repeat Per Story)

```
/bmad-execute draft  →  /bmad-execute develop  →  /bmad-execute done
        ↓                        ↓                         ↓
  Story file               Code + Tests              All checks pass
```

**Creates:**
- Story files with tasks
- Implementation code
- Test coverage
- Progress updates

### Phase 3: Review (Optional)

```
/bmad-review story X.X  →  Decision: PASS/CONCERNS/FAIL  →  Mark Done or Fix
```

**Validates:**
- Acceptance criteria met
- Code quality standards
- Architecture compliance

---

## 4. Commands Reference

### Planning Commands

| Command | Description |
|---------|-------------|
| `/bmad-plan prd` | Create PRD document |
| `/bmad-plan arch` | Create Architecture document |
| `/bmad-plan add-epic` | Add new epic to PRD |
| `/bmad-plan add-story` | Add story to existing epic |

### Execution Commands

| Command | Description |
|---------|-------------|
| `/bmad-execute draft` | Draft next story from PRD |
| `/bmad-execute develop` | Implement current story |
| `/bmad-execute done` | Validate story completion |

### Review Commands

| Command | Description |
|---------|-------------|
| `/bmad-review story X.X` | Full story review |
| `/bmad-review quick X.X` | Quick review (simple stories) |

### Utility Commands

| Command | Description |
|---------|-------------|
| `/bmad-status` | Show project progress |
| `/bmad-sync` | Synchronize documents |
| `/bmad-refactor` | Restructure docs to keep lean |
| `/bmad-shard` | Split large documents into sections |

---

## 5. Best Practices

### Planning Phase

✅ **DO:**
- Define clear project goals
- Keep stories small (2-4 hours each)
- Specify tech stack explicitly
- Include coding standards

❌ **DON'T:**
- Skip Architecture document
- Make stories too large (> 4 hours)
- Leave decisions vague

### Execution Phase

✅ **DO:**
- Check story status before coding
- Use suggested skills
- Follow Source Tree for file locations
- Write tests alongside code
- Update task checkboxes

❌ **DON'T:**
- Develop Draft stories (wait for approval)
- Create files outside Source Tree
- Skip writing tests
- Modify AC during implementation

### Story Sizing

| Size | Time | Example |
|------|------|---------|
| Too Small | < 1 hour | "Add a button" |
| ✅ **Perfect** | **2-4 hours** | **"Create login form with validation"** |
| Too Large | > 4 hours | "Build entire auth system" |

### Code Quality Checklist

Before marking story Done:

- [ ] All acceptance criteria met
- [ ] All tasks checked off
- [ ] Tests written and passing
- [ ] Files in correct locations
- [ ] Follows coding standards
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Linting passes

---

## 6. Troubleshooting

### Common Issues

#### "Story file not found"

```bash
# Create stories folder
mkdir docs/stories
```

#### "PRD not found"

```bash
# Create PRD first
/bmad-plan prd
```

#### "Architecture context not loading"

```bash
# Verify architecture exists
ls docs/architecture.md

# If not, create it
/bmad-plan arch
```

#### Story stuck in wrong status

1. Open story file: `docs/stories/1.1.md`
2. Change `**Status:**` line manually
3. Save and continue

### Reset and Start Over

**Keep code, redo docs:**
```bash
mv docs/ docs-backup/
/bmad-plan prd
/bmad-plan arch
```

**Full reset:**
```bash
rm -rf docs/ src/
/bmad-plan prd
```

---

## Quick Reference

### Typical Development Session

```bash
# === FIRST TIME (Once) ===
/bmad-plan prd          # 15-20 min
/bmad-plan arch         # 10-15 min

# === DAILY DEVELOPMENT (Repeat) ===
/bmad-execute draft     # 5 min
# Review and approve story
/bmad-execute develop   # 30-120 min
/bmad-execute done      # 5 min
/bmad-review story 1.1  # 10-15 min (optional)

# === ADDING FEATURES (As needed) ===
/bmad-plan add-epic     # 15-20 min
/bmad-execute draft     # Continue as above

# === CHECK PROGRESS (Anytime) ===
/bmad-status            # See overall progress
```

### Folder Structure

```
project/
├── .bmad-lite/         # Framework (don't modify)
├── docs/
│   ├── prd.md          # ⭐ Requirements
│   ├── architecture.md # ⭐ Technical design
│   ├── progress.md     # Progress tracking
│   └── stories/        # Story files
│       ├── 1.1.md
│       └── 1.2.md
└── src/                # Your code (defined in architecture)
```

### Story Status Lifecycle

```
Draft → Approved → InProgress → Review → Done
  │        │           │           │
  │        │           │           └─ Validated
  │        │           └───────────── Implementing
  │        └───────────────────────── Ready to build
  └────────────────────────────────── Needs approval
```

---

## Key Documents

### PRD (docs/prd.md)
- **What to build**: Goals, features, user stories
- **Who uses it**: Planner creates, Executor reads
- **Format**: Markdown with Gherkin stories

### Architecture (docs/architecture.md)
- **How to build**: Tech stack, folder structure, standards
- **Who uses it**: Planner creates, Executor follows
- **Critical sections**: Tech Stack, Source Tree, Coding Standards

### Story (docs/stories/X.X.md)
- **Implementation plan**: Tasks, AC, dev notes
- **Who uses it**: Executor creates and implements
- **Status flow**: Draft → Approved → InProgress → Review → Done

---

## Tips for Success

1. **Start Small** - Build one epic first, learn the workflow
2. **Follow Architecture** - Trust the Source Tree and standards
3. **Use Skills** - They significantly improve code quality
4. **Keep Stories Small** - 2-4 hours is the sweet spot
5. **Review Regularly** - Use `/bmad-status` to track progress

---

## Support

- **Full Documentation**: See [README.md](../README.md)
- **Issues**: Report problems on GitHub
- **Skills Library**: Browse `.claude/skills/` for available skills

---

**Version:** 2.0
**Last Updated:** 2026-02-05
**License:** MIT

_BMAD-Lite - Simplified AI-Driven Development_
