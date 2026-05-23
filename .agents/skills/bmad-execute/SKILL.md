---
name: bmad-execute
description: Invokes the Executor agent for development tasks with STRICT compliance to source tree paths, tech stack bounds, coding standards, UX metrics, and performance optimizations.
---

# /bmad-execute - BMAD-Lite Compliant Code Execution

Use this skill to implement user stories and perform development tasks. It enforces strict architectural alignment, UX guidelines, test coverage, and validation rules.

---

## When to Use This Skill
- When drafting a user story file (`*draft-story`).
- When writing or refactoring application code (`*develop`).
- When executing tests and validation checklists (`*run-tests`, `*done-checklist`).
- When checking that files comply with the Source Tree (`*check-structure`).

---

## Usage Actions
Invoke the skill with `/bmad-execute [action]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **`draft`** | Draft the next story file from epics using `templates/story.yaml` |
| **`develop`** | Start/continue implementing the current active story |
| **`done`** | Validate the completion checklist for the active story |
| **`use-skill {name}`** | Invoke specialized expertise (e.g. `@test-driven-development`) |
| **`list-skills`** | Show available technical skills |
| **(no action)** | Display Executor help, active story details, and completion progress |

---

## 🛑 MANDATORY CONTEXT LOADING ORDER
Before writing or changing **ANY** code, you must load the following files in this exact sequence:
1. **`docs/module-graph.md`** → Read first to understand relationships and story links.
2. **`docs/architecture/tech-stack.md`** → Verify approved technologies.
3. **`docs/architecture/source-tree.md` / `source-tree.json`** → Know precisely where code files go.
4. **`docs/architecture/coding-standards.md`** → Load core naming and syntax rules.
5. **`docs/architecture/data-models.md`** → Load TypeScript interfaces.
6. Other files as needed (`components.md`, `database-schema.md`, `test-strategy-and-standards.md`, `security.md`).

---

## ⚡ STRICT COMPLIANCE RULES

### 1. Source Tree Compliance
- **Verify Path:** Before creating a file, check `docs/architecture/source-tree.json`. If the path is not in the source tree → **YOU MUST ASK THE USER FOR APPROVAL** before proceeding. Never write code in random directories.
- **Update Files:** After creating a code file, **IMMEDIATELY** update `docs/architecture/source-tree.json` with the exact path, and update `source-tree.md` if new folders were created.

### 2. Tech Stack & Naming
- **Tech Stack:** Only use technologies and exact versions specified in `docs/architecture/tech-stack.md`.
- **Coding Standards:** Follow naming standards (PascalCase for components, camelCase for hooks/functions, kebab-case for files) defined in `docs/architecture/coding-standards.md`.
- **Interfaces:** Match exact interface names and structures defined in `docs/architecture/data-models.md`.

---

## 🏆 UX & PERFORMANCE REQUIREMENTS

### UX Mandates
- **Loaders:** Always build skeleton screens or load spinners for async states.
- **Errors:** Friendly error toast notifications/messages. Do not output raw JavaScript stack traces.
- **Forms:** Real-time field validations and disabling the submit button during API calls.

### Performance Mandates
- **React:** Memoize expensive tree renders (`React.memo`, `useMemo`, `useCallback`).
- **Caching:** Use TanStack Query hooks for server state caching.
- **Bundles:** Implement code splitting and lazy routing.

---

## 📋 PRE-COMPLETION CHECKLIST
Before marking a task as done, verify:
- [ ] All created files match their Source Tree configurations exactly.
- [ ] `source-tree.json` has been updated with the new code files.
- [ ] All coding standards, Tech Stack versions, and Data Models are fully complied with.
- [ ] UI loading, accessibility (ARIA), and error states are implemented.
- [ ] Tests are written, run, and passing successfully.
