# Sync Docs Task

Synchronize all documentation after adding new epics or stories post-MVP.

---

## Purpose

When you've completed MVP and want to add new functionality:

- Add new Epic to existing PRD
- Add new Story to existing Epic
- Ensure all docs remain consistent
- Update references and cross-links
- Maintain version history

---

## When to Use

Use `/sync` command when:

1. **Adding New Epic** - New feature set after MVP
2. **Adding New Story** - New story to existing epic
3. **Modifying Requirements** - Changes to existing FR/NFR
4. **Updating Architecture** - New components, APIs, or data models
5. **Post-Implementation Sync** - After implementing changes not in original docs

---

## Sync Modes

### Mode 1: Add New Epic

```bash
/sync epic
```

Workflow:

1. Gather new epic requirements
2. Update PRD with new epic
3. Update Architecture if needed
4. Create epic file (if using sharded epics)
5. Update progress tracking

### Mode 2: Add New Story

```bash
/sync story
```

Workflow:

1. Identify target epic
2. Gather new story requirements
3. Update PRD epic section
4. Update epic file (if exists)
5. Validate story fits architecture

### Mode 3: Full Sync

```bash
/sync all
```

Workflow:

1. Scan all completed stories
2. Compare against PRD
3. Identify gaps and inconsistencies
4. Update all docs to match reality

---

## Detailed Workflows

### Adding New Epic

#### Step 1: Gather Epic Information

```
EPIC INFORMATION GATHERING

1. Epic Title: {title}
2. Epic Goal: {2-3 sentences}
3. Business Value: {why this epic matters}
4. Dependencies: {which existing epics/stories it depends on}
5. Estimated Stories: {number}
```

#### Step 2: Check Architecture Impact

```
ARCHITECTURE IMPACT ANALYSIS

Does this epic require:
- [ ] New data models? → Update architecture/data-models.md
- [ ] New API endpoints? → Update architecture/api-spec.yaml
- [ ] New components? → Update architecture/components.md
- [ ] New infrastructure? → Update architecture/infrastructure.md
- [ ] Security changes? → Update architecture/security.md

If any checked, update Architecture first.
```

#### Step 3: Update PRD

**Add to Epic List section:**

```markdown
## Epic List

| #   | Epic             | Goal               | Stories     |
| --- | ---------------- | ------------------ | ----------- | ----- |
| 1   | Foundation       | Project setup      | 5           |
| 2   | Core Features    | Main functionality | 8           |
| 3   | **NEW: {title}** | **{goal}**         | **{count}** | ← NEW |
```

**Add to Epic Details section:**

```markdown
## Epic {n}: {title}

**Added:** {date}
**Reason:** Post-MVP enhancement

### Goal

{2-3 sentences}

### Stories

#### Story {n}.1: {title}

As a {user}, I want {action}, so that {benefit}.

**Acceptance Criteria:**

1. Given..., When..., Then...
```

#### Step 4: Create Epic File (if sharded)

If using `docs/epics/`:

```markdown
# Epic {n}: {title}

**PRD Reference:** docs/prd.md#epic-{n}
**Added:** {date}
**Status:** Ready

## Goal

{goal}

## Stories

...
```

#### Step 5: Update Progress Tracking

Update `docs/progress.md`:

```markdown
## Epic Progress

| Epic | Title         | Status  | Stories | Completed | Progress |
| ---- | ------------- | ------- | ------- | --------- | -------- | ----- |
| 1    | Foundation    | Done    | 5       | 5         | 100%     |
| 2    | Core Features | Done    | 8       | 8         | 100%     |
| 3    | {new title}   | Pending | {n}     | 0         | 0%       | ← NEW |
```

#### Step 6: Validation

```
EPIC SYNC VALIDATION

- [ ] PRD Epic List updated
- [ ] PRD Epic Details added
- [ ] Architecture updated (if needed)
- [ ] Epic file created (if sharded)
- [ ] Progress tracking updated
- [ ] All cross-references valid
- [ ] Change log updated
```

---

### Adding New Story

#### Step 1: Identify Target Epic

```
Which epic does this story belong to?

1. Epic 1: Foundation
2. Epic 2: Core Features
3. Epic 3: ...

Select epic: _
```

#### Step 2: Check Story Fit

```
STORY FIT CHECK

- Does story align with epic goal?
- Does story have clear business value?
- Is story sized correctly (2-4 hours)?
- Does story require architecture changes?
```

#### Step 3: Gather Story Information

```
STORY INFORMATION

1. Story Title: {title}
2. User Story: As a {user}, I want {action}, so that {benefit}
3. Acceptance Criteria:
   - Given..., When..., Then...
4. Dependencies: {previous stories}
5. Architecture Impact: {none | data model | API | component}
```

#### Step 4: Update Architecture (if needed)

If story requires new:

- Data fields → Update data-models.md
- API endpoint → Update api-spec.yaml
- Component → Update components.md

#### Step 5: Update PRD

Add story to epic section:

```markdown
## Epic {n}: {title}

### Story {n}.{m}: {new_title} ← NEW

**Added:** {date}

As a {user}, I want {action}, so that {benefit}.

**Acceptance Criteria:**

1. Given..., When..., Then...
```

#### Step 6: Update Epic File (if sharded)

Add to `docs/epics/epic-{n}.md`

#### Step 7: Update Progress

Update `docs/progress.md`:

```markdown
### Epic {n}: {title}

| Story   | Title       | Status  | Tasks | Notes |
| ------- | ----------- | ------- | ----- | ----- |
| {n}.1   | ...         | Done    | 4/4   |       |
| {n}.{m} | {new_title} | Pending | 0/?   | NEW   |
```

#### Step 8: Validation

```
STORY SYNC VALIDATION

- [ ] PRD updated with new story
- [ ] Epic file updated (if exists)
- [ ] Architecture updated (if needed)
- [ ] Progress tracking updated
- [ ] Story numbered correctly (sequential)
- [ ] Change log updated
```

---

### Full Sync (Reality Check)

#### Step 1: Scan Completed Work

```
1. Read all files in docs/stories/
2. Read all completed code (from File Lists)
3. Build reality map of what was actually built
```

#### Step 2: Compare Against PRD

```
REALITY vs PRD COMPARISON

PRD says:
- Epic 1: 5 stories → Actual: 5 stories ✓
- Epic 2: 8 stories → Actual: 10 stories ⚠️ (2 added during dev)
- FR5: User export → Not implemented ⚠️

Discrepancies found: 3
```

#### Step 3: Compare Against Architecture

```
REALITY vs ARCHITECTURE COMPARISON

Architecture says:
- User model has 8 fields → Actual: 12 fields ⚠️
- 15 API endpoints → Actual: 18 endpoints ⚠️
- 5 components → Actual: 7 components ⚠️

Discrepancies found: 3
```

#### Step 4: Generate Sync Plan

```
SYNC PLAN

1. PRD Updates:
   - Add 2 stories to Epic 2 (2.9, 2.10)
   - Mark FR5 as deferred

2. Architecture Updates:
   - Add 4 fields to User model
   - Add 3 API endpoints
   - Add 2 components

3. Progress Updates:
   - Update story counts

Proceed with sync? (y/n)
```

#### Step 5: Execute Sync

Update all documents according to plan.

#### Step 6: Final Validation

```
FULL SYNC VALIDATION

- [ ] PRD matches reality
- [ ] Architecture matches reality
- [ ] All external files updated
- [ ] Progress tracking accurate
- [ ] All cross-references valid
- [ ] Change logs updated with sync date
```

---

## Change Log Format

When syncing, always update Change Log:

**In PRD:**

```markdown
## Change Log

| Date       | Version | Description             | Author   |
| ---------- | ------- | ----------------------- | -------- |
| 2024-01-15 | 1.0     | Initial PRD             | @planner |
| 2024-02-01 | 1.1     | Added Epic 3: Reporting | @planner |
| 2024-02-15 | 1.2     | Added Story 2.9, 2.10   | @planner |
```

**In Architecture:**

```markdown
## Change Log

| Date       | Version | Description              | Author   |
| ---------- | ------- | ------------------------ | -------- |
| 2024-01-16 | 1.0     | Initial Architecture     | @planner |
| 2024-02-01 | 1.1     | Added reporting models   | @planner |
| 2024-02-15 | 1.2     | Sync with implementation | @planner |
```

---

## Commands

```bash
# IDE Commands
/sync epic          # Add new epic
/sync story         # Add new story
/sync all           # Full sync check

# In Planner Agent
*sync-docs epic
*sync-docs story
*sync-docs all
```

---

## Example: Adding New Epic

```
User: /sync epic

╔════════════════════════════════════════════════════════════╗
║                    ADD NEW EPIC                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Current Epics:                                            ║
║  1. Foundation (5 stories) - DONE                          ║
║  2. Core Features (8 stories) - DONE                       ║
║                                                            ║
║  New Epic will be: Epic 3                                  ║
║                                                            ║
║  Please provide:                                           ║
║  1. Epic Title: ___                                        ║
║  2. Epic Goal (2-3 sentences): ___                         ║
║  3. Estimated number of stories: ___                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

User:
1. Reporting & Analytics
2. Enable users to view usage reports and export data
3. 4 stories

╔════════════════════════════════════════════════════════════╗
║                 ARCHITECTURE IMPACT CHECK                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Does Epic 3: Reporting & Analytics require:               ║
║                                                            ║
║  [x] New data models (Report, ExportJob)                   ║
║  [x] New API endpoints (/reports, /exports)                ║
║  [x] New components (ReportViewer, ExportModal)            ║
║  [ ] Infrastructure changes                                ║
║  [ ] Security changes                                      ║
║                                                            ║
║  Will update architecture first, then PRD.                 ║
║  Proceed? (y/n)                                            ║
╚════════════════════════════════════════════════════════════╝

... (sync proceeds)

╔════════════════════════════════════════════════════════════╗
║                    SYNC COMPLETE                           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Updated files:                                            ║
║  ✓ docs/prd.md (added Epic 3)                              ║
║  ✓ docs/architecture.md (added models, APIs)               ║
║  ✓ docs/architecture/data-models.md                        ║
║  ✓ docs/architecture/api-spec.yaml                         ║
║  ✓ docs/epics/epic-3.md (created)                          ║
║  ✓ docs/progress.md (updated)                               ║
║                                                            ║
║  Next: /execute draft to start Story 3.1                   ║
╚════════════════════════════════════════════════════════════╝
```

---

## Best Practices

1. **Always sync after major changes** - Don't let docs drift from reality
2. **Update architecture first** - Technical decisions before requirements
3. **Keep change logs accurate** - Future you will thank present you
4. **Validate cross-references** - Broken links cause confusion
5. **Run full sync periodically** - Weekly for active projects
