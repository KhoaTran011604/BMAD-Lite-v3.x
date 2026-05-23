# Create Story Task

Detailed workflow for drafting a new story for implementation.

---

## When to Use

- Starting development on a new story
- After planning phase is complete
- When moving to next story in epic

---

## Prerequisites

- PRD exists at `docs/prd.md` (with epic details) OR
- Epic file exists at `docs/epics/epic-{n}.md`
- Architecture exists at `docs/architecture.md`

---

## Workflow Steps

### Step 1: Identify Next Story

```
1. Check docs/stories/ for existing story files
2. Find highest story number completed/in-progress
3. Determine next sequential story
4. If epic complete, prompt user:
   - Continue to Epic {n+1}?
   - Select specific story?
```

**Decision tree:**

```
docs/stories/ is empty?
├── YES → Start with Story 1.1
└── NO  → Find last story
          ├── Last was X.Y (not last in epic) → Next is X.(Y+1)
          └── Last was X.Z (last in epic) → Prompt for Epic X+1
```

**Output:** Story identifier (e.g., "1.3")

---

### Step 2: Load Story Source

```
1. Identify source:
   - If docs/epics/epic-{n}.md exists → use epic file
   - Else → use docs/prd.md Epic Details section

2. Extract story content:
   - Story statement (As a... I want... So that...)
   - Acceptance Criteria (numbered list)
   - Dependencies noted in source
```

**Output:** Story statement and AC

---

### Step 3: Load Architecture Context

```
1. Read docs/architecture.md
2. Extract relevant sections for Dev Notes:
   - Source Tree (file locations)
   - Data Models (relevant entities)
   - API Spec (relevant endpoints)
   - Coding Standards (key rules)
   - Test Strategy (testing requirements)

3. If previous story exists (docs/stories/{prev}.md):
   - Read Dev Record section
   - Extract key learnings/insights
```

**Output:** Dev Notes content with source references

---

### Step 4: Generate Tasks

```
1. Analyze AC to determine implementation tasks
2. Break down into specific, actionable tasks
3. Each task references relevant AC numbers
4. Add subtasks for complex tasks
5. Ensure testing is included
```

**Task generation rules:**

- Each AC should have at least one task covering it
- Tasks should be completable in one focused session
- Include test writing as explicit tasks
- Order tasks logically (setup → implement → test)

**Output:** Task list with AC references

---

### Step 5: Suggest Skills

```
1. Analyze task types:
   - New feature? → @test-driven-development
   - API work? → @api-design-principles
   - React/UI? → @react-best-practices
   - Debugging? → @systematic-debugging

2. Check Skills/ folder for available skills
3. List 2-3 most relevant skills
```

**Output:** Suggested skills list

---

### Step 6: Create Story File

**File location:** `docs/stories/{epic}.{story}.md`

**Use template:** `.bmad-lite/templates/story.yaml`

```markdown
# Story {epic}.{story}: {title}

**Status:** Draft
**Epic:** {epic_title}
**Created:** {today}
**Last Updated:** {today}

## Story

**As a** {user_type},
**I want** {action},
**so that** {benefit}.

## Acceptance Criteria

1. Given {context}, When {action}, Then {expected}
2. Given {context}, When {action}, Then {expected}
3. ...

## Tasks

- [ ] Task 1: {description} (AC: 1, 2)
  - [ ] Subtask 1.1: {specific action}
  - [ ] Subtask 1.2: {specific action}
- [ ] Task 2: {description} (AC: 3)
- [ ] Task 3: Write and run tests (AC: 1, 2, 3)

## Dev Notes

### Relevant Files

- `src/path/to/file.ts` - {purpose}
  [Source: docs/architecture.md#source-tree]

### Data Models

- {Model}: {key fields}
  [Source: docs/architecture.md#data-models]

### API Endpoints

- `{METHOD} /api/endpoint` - {purpose}
  [Source: docs/architecture.md#api-spec]

### Testing Requirements

- Unit tests for: {components}
- Integration tests for: {scenarios}
  [Source: docs/architecture.md#test-strategy]

### Previous Story Insights

{If applicable}
[Source: docs/stories/{prev}.md#dev-record]

## Suggested Skills

- **@test-driven-development** - TDD approach
- **@{framework}-best-practices** - Framework patterns

## Change Log

| Date    | Version | Description   | Author    |
| ------- | ------- | ------------- | --------- |
| {today} | 1.0     | Initial draft | @executor |

## Dev Record

### Agent Model

{To be filled during implementation}

### Completion Notes

{To be filled during implementation}

### File List

{To be filled during implementation}

## Review Results

{Optional - filled by @reviewer}
```

---

### Step 7: Validate Story Draft

Quick validation checklist:

- [ ] Story statement is complete (As a/I want/So that)
- [ ] All AC from source are included
- [ ] Tasks cover all AC
- [ ] Dev Notes have source references
- [ ] Suggested skills are relevant
- [ ] Status is "Draft"

---

### Step 8: Present for Approval

```
Output story file location and summary:

Story {epic}.{story}: {title}
Location: docs/stories/{epic}.{story}.md
Status: Draft

Summary:
- {n} Acceptance Criteria
- {m} Tasks
- Suggested skills: @skill1, @skill2

Ready for your review.
To approve: Change status to "Approved"
To develop: Run *develop or /execute develop
```

---

## Story Status Lifecycle

```
Draft → Approved → InProgress → Review → Done
  │                    │          │
  │                    │          └── Optional: @reviewer validates
  │                    └── @executor implements
  └── User approves for development
```

---

## Quick Reference

### Status Values

| Status     | Meaning                    | Who Sets          |
| ---------- | -------------------------- | ----------------- |
| Draft      | Created, awaiting approval | @executor         |
| Approved   | Ready for implementation   | User              |
| InProgress | Being implemented          | @executor         |
| Review     | Awaiting quality review    | @executor         |
| Done       | Complete and approved      | @reviewer or User |

### Source References Format

```
[Source: docs/architecture.md#section-name]
```

### Task Format

```
- [ ] Task {n}: {description} (AC: {list})
  - [ ] Subtask {n}.1: {specific action}
```

---

## Example

### Input

**From PRD Epic 1:**

```
Story 1.3: User Login

As a registered user,
I want to log in with my credentials,
so that I can access my account.

Acceptance Criteria:
1. Given I'm on login page, When I enter valid credentials, Then I'm logged in
2. Given I enter invalid credentials, When I submit, Then I see error message
3. Given I'm logged in, When I access protected route, Then I can view it
```

### Output (docs/stories/1.3.md)

```markdown
# Story 1.3: User Login

**Status:** Draft
**Epic:** Foundation & Core Setup
**Created:** 2024-01-20
**Last Updated:** 2024-01-20

## Story

**As a** registered user,
**I want** to log in with my credentials,
**so that** I can access my account.

## Acceptance Criteria

1. Given I'm on login page, When I enter valid credentials and submit, Then I'm logged in and redirected to dashboard
2. Given I enter invalid credentials, When I submit the form, Then I see an error message "Invalid email or password"
3. Given I'm logged in, When I access a protected route, Then I can view the content

## Tasks

- [ ] Task 1: Create login form component (AC: 1, 2)
  - [ ] Create LoginForm.tsx with email/password fields
  - [ ] Add form validation (email format, required fields)
  - [ ] Handle form submission
- [ ] Task 2: Implement login API call (AC: 1, 2)
  - [ ] Create auth service with login method
  - [ ] Handle success response (store token, redirect)
  - [ ] Handle error response (display message)
- [ ] Task 3: Add route protection (AC: 3)
  - [ ] Create ProtectedRoute component
  - [ ] Check auth state before rendering
  - [ ] Redirect to login if not authenticated
- [ ] Task 4: Write tests (AC: 1, 2, 3)
  - [ ] Unit tests for LoginForm validation
  - [ ] Integration test for login flow
  - [ ] Test protected route behavior

## Dev Notes

### Relevant Files

- `src/components/auth/LoginForm.tsx` - Login form component
- `src/services/auth.ts` - Authentication service
- `src/components/ProtectedRoute.tsx` - Route guard
  [Source: docs/architecture.md#source-tree]

### Data Models

- User: { id, email, name, createdAt }
  [Source: docs/architecture.md#data-models]

### API Endpoints

- `POST /api/auth/login` - Authenticate user, returns JWT
  [Source: docs/architecture.md#api-spec]

### Testing Requirements

- Unit tests with Vitest
- Integration tests for auth flow
  [Source: docs/architecture.md#test-strategy]

### Previous Story Insights

- JWT token stored in localStorage (from Story 1.2)
- Use AuthContext for state management
  [Source: docs/stories/1.2.md#dev-record]

## Suggested Skills

- **@test-driven-development** - Write tests first for form validation
- **@react-best-practices** - Form handling and state management

## Change Log

| Date       | Version | Description   | Author    |
| ---------- | ------- | ------------- | --------- |
| 2024-01-20 | 1.0     | Initial draft | @executor |

## Dev Record

### Agent Model

{To be filled}

### Completion Notes

{To be filled}

### File List

**Created:**
{To be filled}

**Modified:**
{To be filled}
```

---

## Command

In Executor agent:

```
*draft-story
*draft-story 2.1  # Specific story
```

Or via IDE:

```
/execute draft
/execute draft 2.1
```
