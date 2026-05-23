# Refactor Docs Task

Restructure documentation to keep them lean and focused.

---

## Purpose

When PRD and Architecture grow too large, this command helps:

- **PRD** → Contains only requirements (What & Why)
- **Architecture** → Contains only technical decisions (How)
- **Details** → Extracted to external files for easy maintenance

---

## Principles

### 1. PRD Focuses On (What & Why)

| Keep In PRD                       | Extract Out                      |
| --------------------------------- | -------------------------------- |
| Goals & Background                | ❌ Keep                          |
| Functional Requirements (FR)      | ❌ Keep                          |
| Non-Functional Requirements (NFR) | ❌ Keep                          |
| UI Design Goals (high-level)      | Detailed wireframes → `docs/ui/` |
| Epic List (titles + goals)        | ❌ Keep                          |
| Story statements + AC             | Detailed tasks → `docs/stories/` |

### 2. Architecture Focuses On (How - Decisions)

| Keep In Architecture      | Extract Out                                       |
| ------------------------- | ------------------------------------------------- |
| High-level overview       | ❌ Keep                                           |
| Tech Stack table          | ❌ Keep                                           |
| Data Models (summary)     | Full schemas → `docs/architecture/data-models.md` |
| API Spec (endpoints list) | Full OpenAPI → `docs/architecture/api-spec.yaml`  |
| Component overview        | Full specs → `docs/architecture/components/`      |
| Source Tree               | ❌ Keep                                           |
| Coding Standards          | ❌ Keep                                           |
| Security (overview)       | Full spec → `docs/architecture/security.md`       |

### 3. External Files Structure

```
docs/
├── prd.md                    # Lean PRD (requirements only)
├── architecture.md           # Lean Architecture (decisions only)
├── epics/                    # Epic details (optional)
│   ├── epic-1.md
│   └── epic-2.md
├── architecture/             # Architecture details
│   ├── data-models.md        # Full data model specs
│   ├── api-spec.yaml         # Full OpenAPI spec
│   ├── api-spec.md           # API documentation
│   ├── components.md         # Component specifications
│   ├── security.md           # Security details
│   └── infrastructure.md     # Deployment details
└── ui/                       # UI specifications (optional)
    ├── wireframes/
    └── design-system.md
```

---

## Workflow

### Step 1: Analyze Current Docs

```
1. Read docs/prd.md
2. Read docs/architecture.md
3. Identify sections that are too detailed:
   - PRD section > 50 lines → candidate for extraction
   - Architecture section > 100 lines → candidate for extraction
   - Any section with implementation details
```

**Output:** List of sections to refactor

---

### Step 2: Plan Extraction

For each oversized section, create extraction plan:

```
Section: {name}
Current location: {prd.md|architecture.md}#{section}
Lines: {count}
Action: Extract to {target_file}
Keep in original: {summary with reference}
```

**Present plan to user for approval before proceeding**

---

### Step 3: Create External Files

For each extraction:

```markdown
# {Section Title}

**Source:** Extracted from {prd.md|architecture.md}
**Last synced:** {date}

---

{Full content from original section}
```

---

### Step 4: Update Original Docs

Replace detailed section with summary + reference:

**Before (in architecture.md):**

```markdown
## Data Models

### User

| Field       | Type      | Description        |
| ----------- | --------- | ------------------ |
| id          | UUID      | Primary key        |
| email       | string    | User email, unique |
| password    | string    | Hashed password    |
| name        | string    | Display name       |
| role        | enum      | admin, user, guest |
| createdAt   | timestamp | Creation time      |
| updatedAt   | timestamp | Last update        |
| lastLogin   | timestamp | Last login time    |
| preferences | json      | User preferences   |

| ... (50 more lines)

### Product

| Field | Type | Description |
| ... (100 more lines)
```

**After (in architecture.md):**

```markdown
## Data Models

Core entities for this application:

| Entity  | Purpose         | Key Fields        |
| ------- | --------------- | ----------------- |
| User    | User accounts   | id, email, role   |
| Product | Product catalog | id, name, price   |
| Order   | Purchase orders | id, userId, items |

→ **Full specifications:** [data-models.md](architecture/data-models.md)
```

---

### Step 5: Add Reference Section

At the end of refactored docs, add:

**In PRD:**

```markdown
## Document References

| Document                           | Contains            |
| ---------------------------------- | ------------------- |
| [architecture.md](architecture.md) | Technical decisions |
| [epics/](epics/)                   | Epic details        |
| [ui/](ui/)                         | UI specifications   |
```

**In Architecture:**

```markdown
## Document References

| Document                                      | Contains                |
| --------------------------------------------- | ----------------------- |
| [data-models.md](architecture/data-models.md) | Full data model specs   |
| [api-spec.yaml](architecture/api-spec.yaml)   | OpenAPI specification   |
| [components.md](architecture/components.md)   | Component details       |
| [security.md](architecture/security.md)       | Security specifications |
```

---

### Step 6: Validate References

```
1. Check all internal links work
2. Verify no orphaned content
3. Ensure bidirectional references
4. Run consistency check
```

---

## Refactor Patterns

### Pattern 1: Data Models Extraction

**Keep in architecture.md:**

```markdown
## Data Models

| Entity  | Purpose         | Relations            |
| ------- | --------------- | -------------------- |
| User    | User accounts   | → Orders, Reviews    |
| Product | Product catalog | → Categories, Orders |

→ [Full specifications](architecture/data-models.md)
```

**Extract to architecture/data-models.md:**

```markdown
# Data Models

## User

### Schema

| Field | Type   | Constraints      | Description        |
| ----- | ------ | ---------------- | ------------------ |
| id    | UUID   | PK               | Primary identifier |
| email | string | UNIQUE, NOT NULL | User email         |
| ...   | ...    | ...              | ...                |

### TypeScript Interface

\`\`\`typescript
interface User {
id: string;
email: string;
// ...
}
\`\`\`

### Validation Rules

- Email must be unique
- Password minimum 8 characters
- Name maximum 100 characters
```

---

### Pattern 2: API Spec Extraction

**Keep in architecture.md:**

```markdown
## API Specification

REST API with JWT authentication.

| Resource | Endpoints   | Auth  |
| -------- | ----------- | ----- |
| Users    | CRUD + auth | Mixed |
| Products | CRUD        | Admin |
| Orders   | CRUD        | User  |

→ [Full OpenAPI spec](architecture/api-spec.yaml)
→ [API documentation](architecture/api-spec.md)
```

**Extract to architecture/api-spec.yaml:**

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /api/users:
    get:
      summary: List users
      ...
    post:
      summary: Create user
      ...
```

---

### Pattern 3: Epic Details Extraction

**Keep in PRD:**

```markdown
## Epics

| Epic             | Goal               | Stories   |
| ---------------- | ------------------ | --------- |
| 1. Foundation    | Project setup      | 5 stories |
| 2. Core Features | Main functionality | 8 stories |

→ [Epic details](epics/)
```

**Extract to epics/epic-1.md:**

```markdown
# Epic 1: Foundation

## Goal

Establish project infrastructure and core setup.

## Stories

### Story 1.1: Project Setup

As a developer, I want a configured project...

### Story 1.2: Authentication

...
```

---

## Size Guidelines

### Target Sizes After Refactor

| Document        | Max Lines  | Focus               |
| --------------- | ---------- | ------------------- |
| prd.md          | ~200 lines | Requirements only   |
| architecture.md | ~300 lines | Decisions only      |
| data-models.md  | Unlimited  | Full specifications |
| api-spec.yaml   | Unlimited  | Full OpenAPI        |
| components.md   | Unlimited  | Full specifications |

### When to Extract

| Section      | Extract When                |
| ------------ | --------------------------- |
| Data Models  | > 50 lines per entity       |
| API Spec     | > 10 endpoints              |
| Components   | > 5 components with details |
| Security     | > 30 lines                  |
| Epic Details | > 3 stories per epic        |

---

## Command

```bash
/refactor docs        # Analyze and refactor all docs
/refactor prd         # Refactor PRD only
/refactor arch        # Refactor Architecture only

# In planner agent
*refactor-docs
*refactor-docs prd
*refactor-docs architecture
```

---

## Example Output

```
╔════════════════════════════════════════════════════════════╗
║              DOCUMENT REFACTOR ANALYSIS                    ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  docs/prd.md                                               ║
║  ───────────                                               ║
║  Current: 450 lines → Target: ~200 lines                   ║
║                                                            ║
║  Extraction candidates:                                    ║
║  • Epic Details (280 lines) → docs/epics/                  ║
║  • UI Wireframes (50 lines) → docs/ui/                     ║
║                                                            ║
║  docs/architecture.md                                      ║
║  ────────────────────                                      ║
║  Current: 680 lines → Target: ~300 lines                   ║
║                                                            ║
║  Extraction candidates:                                    ║
║  • Data Models (180 lines) → docs/architecture/data-models.md
║  • API Spec (150 lines) → docs/architecture/api-spec.yaml  ║
║  • Security (80 lines) → docs/architecture/security.md     ║
║                                                            ║
║  Proceed with refactor? (y/n)                              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Post-Refactor Checklist

After refactoring, verify:

- [ ] All links in PRD work correctly
- [ ] All links in Architecture work correctly
- [ ] External files have "Source" and "Last synced" headers
- [ ] No duplicate content between files
- [ ] Reference sections added to main docs
- [ ] Main docs are within target size limits
- [ ] Bidirectional references are in place
