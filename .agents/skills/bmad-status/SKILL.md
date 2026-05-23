---
name: bmad-status
description: Invokes the status reporter to display progress, epic completion stats, currently active user stories, recent activity logs, and active blockers in the workspace.
---

# /bmad-status - BMAD-Lite Progress Status

Use this skill to view the current status of development. It parses active story files and epic listings to calculate overall completion metrics, active blockers, and recently completed stories.

---

## When to Use This Skill
- When you want to see overall progress and epic completion status.
- When inspecting details of a specific user story status.
- When updating progress reports and index indexes.

---

## Usage Actions
Invoke the skill with `/bmad-status [target]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **(no target)** | Renders a formatted overall project completion dashboard |
| **`story {id}`** | Display detail cards for a specific story (e.g. `story 1.3`) |
| **`epic {n}`** | Focus and break down completion progress for epic `{n}` |
| **`update`** | Refresh the progress file index manually by scanning stories |

---

## 📊 DASHBOARD RENDERING DESIGN

```text
╔════════════════════════════════════════════╗
║         PROJECT PROGRESS                    ║
╠════════════════════════════════════════════╣
║ Project: My Todo App                        ║
║ Started: 2024-01-15                         ║
║ Last Updated: 2024-01-20                    ║
╠════════════════════════════════════════════╣
║ EPIC PROGRESS                               ║
╠════════════════════════════════════════════╣
║ Epic 1: Foundation      ████████░░ 80%     ║
║   Stories: 4/5 complete                     ║
║                                             ║
║ Epic 2: Core Features   ░░░░░░░░░░ 0%      ║
║   Stories: 0/4 complete                     ║
╠════════════════════════════════════════════╣
║ CURRENT FOCUS                               ║
╠════════════════════════════════════════════╣
║ Story 1.5: Email Verification               ║
║ Status: InProgress                          ║
║ Tasks: 2/4 complete                         ║
╠════════════════════════════════════════════╣
║ RECENT ACTIVITY                             ║
╠════════════════════════════════════════════╣
║ 2024-01-20 Story 1.4 completed              ║
║ 2024-01-19 Story 1.3 completed              ║
║ 2024-01-18 Story 1.2 completed              ║
╠════════════════════════════════════════════╣
║ BLOCKERS: None                              ║
╚════════════════════════════════════════════╝
```

---

## 🛠️ IMPLEMENTATION ENGINE
1. **Source Discovery:** Scan `docs/progress.md`, `docs/progress/`, and `docs/stories/*.md` to fetch state. If `docs/progress.md` is missing, auto-generate it.
2. **Calculate Progress:** Add total completed tasks vs total defined tasks in story templates. Compute percentages.
3. **Draft Cards:** Map active stories (marked `Status: InProgress`) to the "Current Focus" card.
4. **Display Blockers:** List any story where a blocker has been noted by developers.
5. **English Output:** All statistics, dashboards, log lines, and command explanations must be rendered in **English**.
