# Create Epic Task

Detailed workflow for creating a new epic from PRD.

---

## When to Use

- After PRD is complete and approved
- When you want separate epic files (optional - can use PRD directly)
- For large projects with multiple epics

---

## Prerequisites

- PRD exists at `docs/prd.md`
- Epic List section in PRD is approved

---

## Workflow Steps

### Step 1: Identify Epic to Create

```
1. Read docs/prd.md
2. Find "Epic List" section
3. Identify which epic(s) need separate files
4. Check docs/epics/ for existing epic files
5. Determine next epic number to create
```

**Output:** Epic number and title to create

---

### Step 2: Extract Epic Content from PRD

```
1. Locate "Epic {n}: {title}" section in PRD
2. Extract:
   - Epic goal (2-3 sentences)
   - All stories with their:
     - Story statement (Gherkin format)
     - Acceptance Criteria (numbered)
     - Dependencies
3. Note any cross-epic dependencies
```

**Output:** Epic content extracted

---

### Step 3: Create Epic File

**File location:** `docs/epics/epic-{n}.md`

**Use template:** `.bmad-lite/templates/epic.yaml`

```markdown
# Epic {n}: {title}

**Status:** Ready
**PRD Reference:** docs/prd.md#epic-{n}

## Goal

{2-3 sentences from PRD describing what this epic achieves
and why it matters to users/business}

## Stories

### Story {n}.1: {title}

**As a** {user_type},
**I want** {action},
**so that** {benefit}.

**Acceptance Criteria:**

1. Given {context}, When {action}, Then {expected}
2. Given {context}, When {action}, Then {expected}

**Dependencies:** {list or "None"}
**Estimated Effort:** 2-4 hours

---

### Story {n}.2: {title}

[Continue for all stories...]

## Epic Dependencies

- {Any dependencies on other epics}

## Notes

- {Any additional notes}
```

---

### Step 4: Validate Epic

Run quick validation:

- [ ] Epic goal is clear and valuable
- [ ] Stories are sequential (no story depends on later story)
- [ ] Each story is sized for 2-4 hours
- [ ] All stories have numbered AC
- [ ] Dependencies are noted

---

### Step 5: Update Progress (Optional)

If `docs/progress.md` exists, update Epic Progress table.

---

## Quick Reference

### Epic Status Values

- `Planning` - Being created/refined
- `Ready` - Approved, ready for story execution
- `In Progress` - Stories being implemented
- `Complete` - All stories done

### Story Sizing Guidelines

- **Too small:** Less than 1 hour → combine with another story
- **Just right:** 2-4 hours → ideal for AI agent
- **Too large:** More than 4 hours → split into multiple stories

### Gherkin Format

```
As a {user_type},
I want {action},
so that {benefit}.
```

### AC Format (Given-When-Then)

```
1. Given {precondition/context}, When {action taken}, Then {expected result}
```

---

## Example

### Input (from PRD)

```
Epic 2: User Management
Goal: Enable user profile management and settings

Story 2.1: View Profile
As a logged-in user, I want to view my profile...

Story 2.2: Edit Profile
As a logged-in user, I want to edit my profile...
```

### Output (epic-2.md)

```markdown
# Epic 2: User Management

**Status:** Ready
**PRD Reference:** docs/prd.md#epic-2

## Goal

Enable comprehensive user profile management including viewing,
editing, and customizing user settings. This epic delivers
self-service account management capabilities to users.

## Stories

### Story 2.1: View Profile

**As a** logged-in user,
**I want** to view my profile information,
**so that** I can see my account details.

**Acceptance Criteria:**

1. Given I'm logged in, When I navigate to /profile, Then I see my profile page
2. Given I'm on profile page, When page loads, Then I see my name, email, and avatar
3. Given I'm not logged in, When I try to access /profile, Then I'm redirected to login

**Dependencies:** Epic 1 (Authentication)
**Estimated Effort:** 2-3 hours

---

### Story 2.2: Edit Profile

...
```

---

## Command

In Planner agent:

```
*create-epic {n}
```

Or via IDE:

```
/plan epic
```
