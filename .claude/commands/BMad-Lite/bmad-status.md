# /bmad-status - BMAD-Lite Status Command

Show project progress and current status.

---

## Usage

```
/bmad-status [target]
```

**Targets:**

- (no target) - Show overall project progress
- `story {id}` - Show specific story status
- `epic {n}` - Show epic progress
- `update` - Update progress file

---

## How It Works

Reads from `docs/progress.md` and `docs/stories/` to display:

- Overall project completion
- Epic progress breakdown
- Current active story
- Recent activity
- Any blockers

---

## Progress File Location

```
docs/
├── progress.md           # Overall status (this command reads/updates)
└── stories/
    ├── 1.1.md           # Story files
    ├── 1.2.md
    └── ...
```

---

## Output Example

```
User: /status

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

Commands:
- /execute develop    Continue current story
- /status story 1.5   View story details
- /status update      Refresh progress file
```

---

## Story Status Example

```
User: /status story 1.5

Story 1.5: Email Verification
═══════════════════════════════════════

Status: InProgress
Epic: 1 - Foundation
Created: 2024-01-20
Last Updated: 2024-01-20

Acceptance Criteria:
1. ✓ User receives verification email
2. ✓ Email contains valid token
3. ○ Token expires after 24 hours
4. ○ User can resend verification

Tasks:
[x] Task 1: Email service setup (AC: 1, 2)
[x] Task 2: Token generation (AC: 2)
[ ] Task 3: Token validation (AC: 3)
[ ] Task 4: Resend functionality (AC: 4)

Progress: 50% (2/4 tasks)

Commands:
- /execute develop    Continue implementation
- /review story 1.5   Review when complete
```

---

## Implementation Notes

This command:

1. Reads `docs/progress.md` for overview
2. Scans `docs/stories/*.md` for story statuses
3. Calculates progress percentages
4. Identifies current active story
5. Lists recent completions

If `docs/progress.md` doesn't exist, creates it from stories.
