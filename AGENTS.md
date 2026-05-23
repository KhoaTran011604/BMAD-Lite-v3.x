# BMAD-Lite Workspace Guidelines (Antigravity CLI)

Welcome to the BMAD-Lite workspace. This repository utilizes the **BMAD-Lite Framework** for structured development and planning. As an Antigravity Agent, you are bound by these project-level instructions which are automatically loaded at session start.

---

## ⚠️ CRITICAL CORE RULES (STRICT COMPLIANCE)

### 1. English Only Policy
- **EVERY SINGLE output** (generated code, comments, commit messages, PRDs, architecture specifications, stories, reviews, and logs) **MUST be written in English**. 
- Never output in Vietnamese or any other language unless explicitly requested by the user.

### 2. Source Tree Compliance (MANDATORY)
- **Before creating ANY new file**:
  1. Load and read `docs/architecture/source-tree.json` for exact file paths.
  2. Verify the target path exists in the defined source tree structure.
  3. If the path does not exist in the source tree → **YOU MUST ASK THE USER FOR PERMISSION** before creating it.
  4. **NEVER** create files outside defined paths.
- **After creating/writing new CODE files**:
  1. **IMMEDIATELY** update `docs/architecture/source-tree.json` with the exact relative file paths.
  2. Update `docs/architecture/source-tree.md` if new folders/directories were added.
  3. *Exception:* Assets (images, fonts, icons) and non-code files do not need source-tree.json updates.

### 3. Tech Stack Compliance
- **ONLY use technologies, libraries, and frameworks defined in the Tech Stack.**
- Load and inspect `docs/architecture/tech-stack.md` to check approved technologies and exact version bounds.
- If you need a new technology, dependency, or version update → **YOU MUST ASK THE USER FOR PERMISSION** first.

### 4. Data Model & Coding Standards Compliance
- **Data Models:** Use the exact TypeScript interfaces and relationship patterns specified in `docs/architecture/data-models.md`.
- **Coding Standards:** Follow all rules and naming conventions defined in `docs/architecture/coding-standards.md` without exception.

---

## 📂 ARCHITECTURE CONTEXT LOADING ORDER
Before beginning development (`/bmad-execute develop`) or writing any code, you must read the following files in this precise sequence to load project context:
1. `docs/module-graph.md` (Module relationships & story links)
2. `docs/architecture/tech-stack.md` (Approved technologies)
3. `docs/architecture/source-tree.md` / `docs/architecture/source-tree.json` (File structure)
4. `docs/architecture/coding-standards.md` (Coding standards)
5. `docs/architecture/data-models.md` (Entity interfaces)
6. `docs/architecture/components.md` (Component definitions)

---

## ⚡ UX & PERFORMANCE MANDATES

### UX Best Practices
- **Loading States:** Always implement loader indicators or skeleton screens for async operations.
- **Error Handling:** Catch errors gracefully, logging details for debuggers, but displaying friendly and actionable messages to users. Never show raw error objects.
- **Accessibility:** Use semantic HTML, ARIA labels, and ensure keyboard navigation works (e.g. Escape to close dialogs).

### Performance Best Practices
- **React Performance:** Memoize heavy components (`React.memo`), calculations (`useMemo`), and callback handlers (`useCallback`) to avoid redundant re-renders.
- **Data Fetching:** Use TanStack Query for server state management and caching.
- **Database Queries:** Ensure proper indexing is specified, avoid N+1 queries, and paginate large datasets.

---

## 🛠️ CUSTOM WORKFLOW SLASH COMMANDS
The workspace is equipped with local Antigravity Skills that you can execute in the chat TUI:

| Slash Command | Persona | Purpose | Action Examples |
| :--- | :--- | :--- | :--- |
| **`/bmad-scan`** | Scanner | Scan brownfield project structures and bootstrap docs | `/bmad-scan arch`, `/bmad-scan prd`, `/bmad-scan quick` |
| **`/bmad-plan`** | Planner | Strategic design and monolithic planning | `/bmad-plan prd`, `/bmad-plan arch`, `/bmad-plan vert-to-v3` |
| **`/bmad-execute`** | Executor | Strict compliant story execution and testing | `/bmad-execute draft`, `/bmad-execute develop` |
| **`/bmad-review`** | Reviewer | QA validator & automatic progress updater | `/bmad-review story 1.3`, `/bmad-review artifacts` |
| **`/bmad-refactor`**| Planner | Splits and extracts bloated documentation blocks | `/bmad-refactor docs`, `/bmad-refactor prd` |
| **`/bmad-shard`** | Planner | Explodes monolith documents into section files | `/bmad-shard prd`, `/bmad-shard architecture` |
| **`/bmad-status`** | Executor | Renders overall epic/story progress indicators | `/bmad-status`, `/bmad-status story 1.1` |
| **`/bmad-sync`** | Planner | Re-synchronizes docs and code schema post-MVP | `/bmad-sync all`, `/bmad-sync epic`, `/bmad-sync story` |
