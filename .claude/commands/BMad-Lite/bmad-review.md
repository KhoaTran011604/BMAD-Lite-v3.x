# /bmad-review - BMAD-Lite Review Command

Invoke the Reviewer agent for quality validation (optional).

---

## Usage

```
/bmad-review [action] [story_id]
```

**Actions:**
- `story {id}` - Full review of specific story (e.g., `/bmad-review story 1.3`)
- `quick {id}` - Quick review for low-risk changes
- `artifacts` - Validate all planning documents
- (no action) - Show reviewer help

---

## Activation

Load and activate the Reviewer agent:
1. Read `.bmad-lite/agents/reviewer.md`
2. Follow activation instructions in the agent file
3. Load `.bmad-lite/config.yaml` for project settings

---

## Agent: Reviewer

**Role:** Quality Guardian & Acceptance Validator
**Combines:** QA + Product Owner
**Status:** OPTIONAL - Use when quality assurance is needed

**Core Capabilities:**
- Review story implementations
- Validate acceptance criteria
- Check code quality
- Provide PASS / CONCERNS / FAIL decisions
- **Auto-update progress on PASS** (story status + changelog + progress)

**Approach:**
- Advisory excellence (recommend, don't block)
- Adaptive depth based on story risk
- Quick reviews for simple changes
- Deep analysis for complex changes

---

## Quick Commands

After activation, use these commands with `*` prefix:

- `*review-story {id}` - Full story review
- `*quick-review {id}` - Fast review
- `*validate-artifacts` - Check all planning docs
- `*help` - Show all commands
- `*exit` - Exit reviewer mode

---

## Review Decisions

| Decision | Meaning | Auto Action |
|----------|---------|-------------|
| **PASS** | All AC met, quality acceptable | Auto: mark Done + update changelog + update progress |
| **CONCERNS** | Minor issues, can proceed | Note issues in story, continue (no auto-update) |
| **FAIL** | Critical issues | Must fix before continuing |

---

## PASS Auto-Update Flow

When the Reviewer decides **PASS**, the following updates happen automatically (no user confirmation needed):

```
PASS Decision
│
├── 1. UPDATE STORY FILE (docs/stories/{epic}.{story}.md)
│   └── Set status: Done
│   └── Add Review Results section (date, decision, notes)
│
├── 2. UPDATE CHANGELOG (docs/progress/changelog.md)
│   └── Append row: | {today} | {story_id} | Done: {story_title} - {summary} (Reviewed: PASS) |
│
├── 3. UPDATE PROGRESS (docs/progress/epic-{range}.md)
│   └── Set story row status: ✅ Done
│   └── Add notes from review
│
├── 4. UPDATE PROGRESS INDEX (docs/progress/index.md)
│   └── Increment "Completed" count if changed
│   └── Update epic row "Done" count if changed
│
└── 5. UPDATE MODULE GRAPH (docs/module-graph.md) — only if new module/relationship was added
```

### Progress File Mapping

| Epic Range | Progress File |
|------------|---------------|
| 1-7        | `docs/progress/epic-1-to-7.md` |
| 8-10       | `docs/progress/epic-8-to-10.md` |
| 11-13      | `docs/progress/epic-11-to-13.md` |
| 14+        | Create new file or extend latest |

---

## Example Session — PASS with Auto-Update

```
User: /bmad-review story 3.3

Reviewer: Loading story 3.3: Bank Account Management...
Reading implementation files...

ACCEPTANCE CRITERIA VALIDATION:
| AC | Status | Notes |
|----|--------|-------|
| 1  | ✓      | CRUD operations working correctly |
| 2  | ✓      | Default bank account pre-save hook |
| 3  | ✓      | 64 tests passing |

CODE QUALITY: Pass
TEST COVERAGE: 64 tests (unit + integration)

DECISION: PASS ✓

Auto-updating docs...
  ✓ docs/stories/3.3.md — status set to Done, review results added
  ✓ docs/progress/changelog.md — appended: "Done: Bank Account Management - 64 tests, pre-save hook (Reviewed: PASS)"
  ✓ docs/progress/epic-1-to-7.md — story 3.3 marked ✅ Done
  ✓ docs/progress/index.md — counts verified (no change needed)

All updates complete. Story 3.3 is Done.
```

## Example Session — CONCERNS (No Auto-Update)

```
User: /bmad-review story 11.4

Reviewer: Loading story 11.4: Fund Reconciliation Report...

DECISION: CONCERNS

Issues:
1. Missing test coverage for PDF export - Minor

Recommendations:
- Add unit tests for PDF generation

Story can proceed. Issues noted in story file.
No auto-update — story remains InProgress until issues resolved or user manually approves.
```

---

## When to Use Review

**Always review:**
- Security-related stories
- Complex business logic
- Stories with many AC
- New patterns or technologies

**Can skip review:**
- Simple CRUD operations
- Minor UI tweaks
- Configuration changes
- Documentation updates
