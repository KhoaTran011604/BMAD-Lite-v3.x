# Story Done Checklist

Validation checklist for story completion.
Run this before marking a story as "Ready for Review" or "Done".

---

## How to Use

Run through each section for the current story.
All items should be ✓ before story can be marked complete.

---

## 1. Acceptance Criteria

- [ ] All acceptance criteria from story are met
- [ ] Each AC has been tested (manually or automated)
- [ ] No AC is partially complete

| AC  | Met? | Test Coverage             |
| --- | ---- | ------------------------- |
| 1   | [ ]  | {unit/integration/manual} |
| 2   | [ ]  | {unit/integration/manual} |
| 3   | [ ]  | {unit/integration/manual} |

---

## 2. Tasks Completion

- [ ] All tasks are marked [x] in story file
- [ ] All subtasks are marked [x]
- [ ] No tasks were skipped without documentation

---

## 3. Code Quality

### 3.1 Coding Standards

- [ ] Code follows coding standards from architecture
- [ ] Naming conventions are followed
- [ ] File organization matches source tree

### 3.2 Code Review Items

- [ ] No console.log or debug code left in
- [ ] No commented-out code blocks
- [ ] No TODO comments (or they're documented)
- [ ] No hardcoded values that should be config

---

## 4. Testing

### 4.1 Test Coverage

- [ ] Unit tests written for new code
- [ ] Integration tests where required
- [ ] All tests pass

### 4.2 Test Quality

- [ ] Tests actually test the functionality (not just coverage)
- [ ] Edge cases are covered
- [ ] Error scenarios are tested

### 4.3 Regression

- [ ] All existing tests still pass
- [ ] No breaking changes to existing functionality

---

## 5. Documentation

### 5.1 Story Documentation

- [ ] Dev Record section is complete
- [ ] Completion Notes document key decisions
- [ ] File List is accurate and complete
- [ ] Change Log is updated

### 5.2 Code Documentation

- [ ] Complex logic has comments
- [ ] Public APIs have JSDoc/docstrings (if required)

---

## 6. Build & Deploy

- [ ] Code compiles/builds without errors
- [ ] No new linting warnings (or they're justified)
- [ ] Dependencies are properly declared
- [ ] No security vulnerabilities in new dependencies

---

## Results Summary

| Category            | Status | Notes |
| ------------------- | ------ | ----- |
| Acceptance Criteria | {✓/✗}  |       |
| Tasks Complete      | {✓/✗}  |       |
| Code Quality        | {✓/✗}  |       |
| Testing             | {✓/✗}  |       |
| Documentation       | {✓/✗}  |       |
| Build & Deploy      | {✓/✗}  |       |

**Overall Status:** {PASS | FAIL}

**If FAIL, issues to address:**

1. {Issue}
2. {Issue}

---

## Story Status Update

If all checks pass:

- Update story status to: **Review** (if reviewer will review)
- Or update story status to: **Done** (if no review needed)
- Update `docs/progress.md` with completion
