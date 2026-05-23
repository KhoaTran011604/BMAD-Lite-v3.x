---
name: bmad-review
description: Invokes the Reviewer agent to perform quality validation, verify acceptance criteria, inspect code standards, and automatically execute the PASS Auto-Update Flow for completed stories.
---

# /bmad-review - BMAD-Lite Quality & Acceptance Review

Use this skill to perform quality validation audits on completed user stories. It validates acceptance criteria, checks code compliance, and updates project progress indicators.

---

## When to Use This Skill
- When a user story's implementation is ready for QA or Product Owner sign-off.
- When validating all planning artifacts (`docs/prd.md`, `docs/architecture.md`, etc.).
- When you want to trigger the automated progress update flow upon story acceptance.

---

## Usage Actions
Invoke the skill with `/bmad-review [action]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **`story {id}`** | Perform a full validation review of a specific story (e.g. `story 1.3`) |
| **`quick {id}`** | Run a fast-track review for low-risk or minor changes |
| **`artifacts`** | Validate planning documents, references, and cross-links |
| **(no action)** | Display Reviewer help, guidelines, and review history |

---

## ⚖️ REVIEW DECISIONS & ACTIONS

| Decision | Meaning | Action / Auto Flow |
| :--- | :--- | :--- |
| 🟢 **PASS** | Meets all AC, high code quality, testing pyramid complete | **Auto-Update Flow executes immediately** |
| 🟡 **CONCERNS**| Minor issues found but acceptable to proceed | Note concerns in the story file, continue without auto-update |
| 🔴 **FAIL** | Critical failures or architectural non-compliance | Block progress, list issues, require fixes before re-review |

---

## ⚡ AUTOMATED PASS UPDATE FLOW (CRITICAL)
Upon deciding a story **PASSES**, you must immediately and automatically apply the following updates without needing separate user prompts:

1. **Update Story File (`docs/stories/{epic}.{story}.{short-title}.md`):**
   - Set `Status: Done`.
   - Append a `## Review Results` section containing Date, Decision (PASS), and brief notes.
2. **Update Changelog (`docs/progress/changelog.md`):**
   - Append a new row in the changelog table:
     `| {Date} | {Story ID} | Done: {Title} - {Summary} (Reviewed: PASS) |`
3. **Update Epic Progress File (`docs/progress/epic-{range}.md`):**
   - Find the epic range matching the story (e.g. `1-7` maps to `docs/progress/epic-1-to-7.md`).
   - Mark the story row status as `✅ Done` and write brief review notes.
4. **Update Progress Index (`docs/progress/index.md`):**
   - Increment the "Completed" count and update individual epic count trackers.
5. **Update Module Graph (`docs/module-graph.md`):**
   - Only update if new modules or module-story links were introduced.

---

## Review Standards
- **Relentless Focus:** Verify Gherkin test matches and Gherkin outputs.
- **Language Policy:** All reviews, feedback, and documentation edits must be in **English**.
