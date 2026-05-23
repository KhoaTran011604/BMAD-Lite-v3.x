---
name: bmad-sync
description: Invokes the document synchronization manager to align documentation post-MVP, check implementation drift, and regenerate source-tree.json.
---

# /bmad-sync - BMAD-Lite Documentation Sync

Use this skill to synchronize your documentation, requirements, and architecture specifications when adding new features post-MVP or to correct documentation drift.

---

## When to Use This Skill
- When the MVP phase is complete and you want to introduce a new Epic or User Story.
- When implementation code has deviated from written requirements (drift check).
- When you want to automatically rebuild `docs/architecture/source-tree.json` based on the actual physical files in `src/`.

---

## Usage Actions
Invoke the skill with `/bmad-sync [mode]` or execute actions using the `*` prefix:

| Mode | Description |
|---|---|
| **`epic`** | Add a new epic post-MVP, update requirements, architecture, and epic trackers |
| **`story`** | Add a new user story to an existing epic, and plan code locations |
| **`all`** | Run a full reality check comparing src/ directories against docs, and update `source-tree.json` |

---

## 🚀 SYNCHRONIZATION WORKFLOWS

### 1. Adding a New Epic (`/bmad-sync epic`)
1. Gather the title, core goals, and list of stories for the new Epic.
2. Analyze the impact on system components, API specs, and database tables.
3. Update `docs/architecture.md` (and sharded `/docs/architecture/` files if they exist) to include the new models or components.
4. Update `docs/prd.md` to append the new Epic, create the sharded epic file, and increment the progress tracking files.

### 2. Adding a New Story (`/bmad-sync story`)
1. Select the target Epic.
2. Gather Story details (Title, Gherkin "As a/I want/so that", Acceptance Criteria).
3. Evaluate architecture impact. If none, append the story directly to the PRD, the sharded epic file, and the progress trackers.

### 3. Full Sync reality Check (`/bmad-sync all`)
1. Scan all completed stories under `docs/stories/`.
2. Cross-reference them with PRD files and Architecture files.
3. **Regenerate `docs/architecture/source-tree.json`:** Read the actual files inside the `src/` directory and reconstruct `source-tree.json`.
4. Update `docs/module-graph.md` to ensure links and module graphs map current code structures.
5. Create a synchronization plan detailing discrepancies, and execute them upon user approval.

---

## 📝 CHANGE LOG AUTOMATION
All synchronizations must append a new entry to the project Change Logs:
```markdown
| Date       | Version | Description                  | Author   |
| ---------- | ------- | ---------------------------- | -------- |
| {Date}     | {Ver}   | Added Epic {n}: {Title}      | @planner |
```

- **English Only:** All logs, change records, and updated files must be written in **English**.
