---
name: bmad-plan
description: Invokes the Planner agent for strategic design, product requirements, system architecture modeling, epic planning, and monolith-to-v3 conversion.
---

# /bmad-plan - BMAD-Lite Planning & Solution Architecture

Use this skill to perform strategic product planning and system architecture design. It manages requirements in the PRD, technical decisions in the Architecture document, and planning epics/stories.

---

## When to Use This Skill
- When designing new features or defining requirements (PRD).
- When planning the system architecture (tech stack, data models, source tree).
- When converting monolith files into distributed v3 structures.
- When creating, adding, or modifying epics and stories.

---

## Usage Actions
Invoke the skill with `/bmad-plan [action]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **`prd`** | Draft or refine the Product Requirements Document (PRD) |
| **`arch`** or **`architecture`** | Draft or refine the Architecture Document |
| **`vert-to-v3`** | Convert monolithic files to sharded V3 folder structures |
| **`epic`** | Create epic files from the PRD |
| **`add-epic`** | Gather requirements and add a new epic to the PRD & Architecture |
| **`add-story`** | Select an epic and add a new user story with acceptance criteria |
| **`update-epic`** | Modify an existing epic's goal or restructure its stories |
| **`update-story`** | Edit an existing story's Gherkin statements or acceptance criteria |
| **`brainstorm`** | Start a structured brainstorming session for project discovery |
| **`validate`** | Run planning validation checks and checklists |
| **`shard`** | Split monolith documents into sections based on headers |
| **(no action)** | Display Planner help, available commands, and project status |

---

## Step-by-Step Execution Workflows

### 1. Document Creation Workflow
- **`*create-prd`** → Generates `docs/prd.md`. Pre-populate sections with educated guesses based on context, then validate with the user.
- **`*create-architecture`** → Generates `docs/architecture.md` (requires `docs/prd.md` first).
- *Strict Constraint:* Maintain the exact template headings as described in `.bmad-lite/agents/planner.md` to ensure automatic sharding works.

### 2. Add Epic Workflow (`*add-epic`)
1. **Gather Requirements:** Ask the user about the feature scope, problems, users, and behaviors.
2. **Analyze Impact:** Read the PRD and Architecture. Identify new Functional Requirements, UI screens, TypeScript entities, API endpoints, and database tables.
3. **Draft Epic:** Write user stories in Gherkin format with clear Acceptance Criteria.
4. **Present & Update:** Present changes to the user for approval. Once approved, update `docs/prd.md`, `docs/architecture.md`, and any sharded folders.

### 3. Convert to v3 Workflow (`*vert-to-v3`)
1. **Shard Monoliths:** Split `docs/prd.md` and `docs/architecture.md` into sharded folders (`docs/prd/` and `docs/architecture/`).
2. **Generate Module Graph:** Scan models & components to generate `docs/module-graph.md`.
3. **Archive Monoliths:** Move old files to `docs/archived/` and append to `.gitignore`.
4. **Update Settings:** Update `.bmad-lite/config.yaml` to point to sharded paths and set output mode to `sharded`.

---

## Strategic Principles
- **Monolith-first for Greenfield:** Always design in single files (`docs/prd.md` & `docs/architecture.md`) first to allow easy reviewing and editing before converting to V3.
- **English-Only output** is strictly enforced.
