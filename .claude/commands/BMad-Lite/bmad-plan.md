# /bmad-plan - BMAD-Lite Planning Command

Invoke the Planner agent for strategic planning tasks.

---

## Usage

```
/bmad-plan [action]
```

**Actions:**

| Action | Description |
|--------|-------------|
| `prd` | Create PRD document |
| `arch` / `architecture` | Create Architecture document |
| `epic` | Create epic files from PRD |
| `add-epic` | Add new epic to existing PRD |
| `add-story` | Add new story to existing epic |
| `update-epic` | Modify existing epic |
| `update-story` | Modify existing story |
| `brainstorm` | Start brainstorming session |
| `validate` | Run planning checklist |
| `shard` | Split documents into sections |
| (no action) | Show planner help |

---

## Activation

Load and activate the Planner agent:
1. Read `.bmad-lite/agents/planner.md`
2. Follow activation instructions in the agent file
3. Load `.bmad-lite/config.yaml` for project settings

---

## Agent: Planner

**Role:** Strategic Planner & Solution Architect
**Combines:** Product Manager + Architect

**Core Capabilities:**
- Create PRD → outputs directly to `docs/prd/` folder (distributed, NOT single file)
- Create Architecture → outputs directly to `docs/architecture/` folder (distributed)
- Plan epics and stories
- Add/update epics and stories post-MVP
- Validate planning artifacts

**Key Principles:**
- **PRD** = Requirements (What & Why)
- **Architecture** = Technical (How)
- **Distributed by default** — each section is its own file, max 200 lines/file
- **No monolith files** — `*shard` only needed for legacy docs

---

## Quick Commands

After activation, use these commands with `*` prefix:

### Document Creation (Distributed Output)
- `*create-prd` - Create PRD → `docs/prd/` folder (multiple files)
- `*create-architecture` - Create Architecture → `docs/architecture/` folder
- `*create-epic` - Create epic file

### Add/Update Features
- `*add-epic` - Add new epic to PRD (+ update Architecture)
- `*add-story` - Add new story to existing epic
- `*update-epic` - Modify existing epic
- `*update-story` - Modify existing story

### Utilities
- `*shard prd` - Split PRD into sections
- `*shard architecture` - Split Architecture into sections
- `*planning-checklist` - Validate artifacts
- `*help` - Show all commands
- `*exit` - Exit planner mode

---

## Add Epic Workflow

**Command:** `/bmad-plan add-epic` or `*add-epic`

**Purpose:** Add a new feature/epic to existing PRD and update Architecture if needed.

### Step-by-Step Process

```
1. GATHER REQUIREMENTS
   ├── User describes new feature
   ├── Clarify: problem, users, behavior
   └── Determine scope and priority

2. ANALYZE IMPACT
   ├── Read existing PRD
   ├── Read existing Architecture
   └── Identify:
       ├── New FRs/NFRs needed
       ├── New UI screens
       ├── Technical implications
       └── Impact on existing epics

3. DRAFT EPIC (for PRD)
   ├── Epic goal (2-3 sentences)
   ├── Stories with Gherkin format
   ├── Acceptance Criteria
   └── Update Epic List, Requirements, UI Goals

4. IDENTIFY ARCHITECTURE UPDATES
   ├── Data Models (new entities?)
   ├── Components (new services?)
   ├── REST API Spec (new endpoints?)
   ├── Database Schema (new tables?)
   ├── Source Tree (new folders?)
   └── Security (new permissions?)

5. PRESENT CHANGES
   ├── Show new epic content
   ├── Show PRD updates
   ├── Show Architecture updates
   └── Ask for approval

6. UPDATE FILES
   ├── Update docs/prd.md
   ├── Update docs/architecture.md
   ├── Update sharded files if exist
   └── Update Change Logs
```

### Example Session

```
User: /bmad-plan add-epic

Planner: I'll help you add a new epic. Please describe the feature:
- What problem does it solve?
- Who will use it?
- What's the expected behavior?

User: I want to add a notification system. Users should receive
email and in-app notifications for important events.

Planner: Analyzing impact...

Reading docs/prd.md... ✓
Reading docs/architecture.md... ✓

Impact Analysis:
- PRD: New Epic needed, 2 new FRs
- Architecture Updates:
  ├── Data Models: Notification entity
  ├── Components: NotificationService
  ├── API: /api/notifications endpoints
  ├── Database: notifications table
  └── Source Tree: src/services/notification/

Here's the new epic for PRD:

## Epic 4: Notification System

**Goal:** Enable users to receive timely notifications about
important events via email and in-app channels.

### Story 4.1: In-App Notification Display
**As a** user,
**I want** to see notifications in the app,
**so that** I'm aware of important events.

**Acceptance Criteria:**
1. Given I have unread notifications, When I open the app,
   Then I see a notification badge
2. Given I click the notification bell, When notifications load,
   Then I see a list of recent notifications

[... more stories ...]

---

Architecture Updates:

### Data Models (new entity):
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'in_app';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
```

### New API Endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List user notifications |
| PATCH | /api/notifications/:id/read | Mark as read |

---

Do you approve these changes?
Reply "approve" to update files or suggest modifications.

User: approve

Planner: Updating files...

✓ docs/prd.md - Added Epic 4, updated Epic List, added FR15-FR16
✓ docs/architecture.md - Updated Data Models, API Spec, Database Schema

Files updated successfully!

Next: Run *shard prd and *shard architecture to update sharded files.
```

---

## Add Story Workflow

**Command:** `/bmad-plan add-story` or `*add-story`

**Purpose:** Add a new story to an existing epic.

### Example Session

```
User: /bmad-plan add-story

Planner: Which epic should I add the story to?

User: Epic 2 - I need a story for bulk user import

Planner: Got it. Let me draft the story:

### Story 2.5: Bulk User Import
**As an** administrator,
**I want** to import multiple users from a CSV file,
**so that** I can quickly onboard many users at once.

**Acceptance Criteria:**
1. Given I have a CSV with valid user data, When I upload it,
   Then all users are created successfully
2. Given the CSV has invalid data, When I upload it,
   Then I see which rows failed with reasons

Architecture Impact:
- API: New POST /api/users/bulk endpoint
- No new data models needed

Approve?

User: approve

Planner: Updated docs/prd.md - Added Story 2.5 to Epic 2
```

---

## Update Commands

### *update-epic

Modify an existing epic's goal or restructure its stories.

```
User: /bmad-plan update-epic

Planner: Which epic do you want to update?

User: Epic 1 - I want to change the goal

Planner: Current goal:
"Enable secure user authentication and session management."

What should the new goal be?
```

### *update-story

Modify an existing story's description or acceptance criteria.

```
User: /bmad-plan update-story

Planner: Which story? (e.g., "1.3")

User: 2.3 - Need to add more acceptance criteria

Planner: Current Story 2.3:
[Shows current content]

What changes are needed?
```

---

## Key Principles

### PRD vs Architecture

| In PRD | In Architecture |
|--------|-----------------|
| What the feature does | How it's built |
| User stories | Technical design |
| Acceptance criteria | Data models |
| Business requirements | API specifications |
| UI/UX goals | Component structure |
| Non-functional requirements | Database schema |

### When Adding Features

1. **Start in PRD** - Define what users need
2. **Then update Architecture** - Define how to build it
3. **Keep them in sync** - Changes flow from PRD to Architecture

### Distributed Documents (Default)

Documents are created as distributed files by default (`docs/prd/`, `docs/architecture/`):
- Update individual section files directly
- `*shard` only needed for legacy monolith files
- Keep `index.md` in sync when adding/removing sections
- Max 200 lines per file — split further if needed
