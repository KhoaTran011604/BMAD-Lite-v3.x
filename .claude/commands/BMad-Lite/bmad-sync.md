# /bmad-sync - BMAD-Lite Sync Command

Synchronize documentation after adding new epics or stories post-MVP.

---

## Usage

```
/bmad-sync [mode]
```

**Modes:**

- `epic` - Add a new epic to existing docs
- `story` - Add a new story to existing epic
- `all` - Full sync check (compare reality vs docs)

---

## When to Use

Use this command when:

1. **MVP Complete** - You've finished initial development and want to add features
2. **New Epic Needed** - Adding a new feature set
3. **New Story Needed** - Adding a story to existing epic
4. **Docs Drifted** - Implementation differs from documentation

---

## Modes Explained

### /sync epic

Adds a new epic to your project:

```
1. Gather epic information (title, goal, stories)
2. Check architecture impact (new models, APIs?)
3. Update Architecture (if needed)
4. Update PRD with new epic
5. Create epic file (if using sharded epics)
6. Update progress tracking
```

### /sync story

Adds a new story to existing epic:

```
1. Select target epic
2. Gather story information
3. Check architecture impact
4. Update Architecture (if needed)
5. Update PRD epic section
6. Update epic file (if exists)
7. Update progress tracking
```

### /sync all

Full reality check and synchronization:

```
1. Scan all completed stories
2. Compare against PRD
3. Compare against Architecture
4. Identify discrepancies
5. Regenerate source-tree.json from actual src/ files
6. Update module-graph.md with any new modules/relationships
7. Generate sync plan
8. Execute sync with approval
```

### Sync Artifacts (always checked during /sync all)

| Artifact | Action |
|----------|--------|
| `docs/architecture/source-tree.json` | Regenerate from `src/` directory scan |
| `docs/architecture/source-tree.md` | Update if new folders were added |
| `docs/module-graph.md` | Update relationships and story links |
| `docs/progress/` | Update relevant progress file |

---

## Example: Adding New Epic

```
User: /sync epic

Current Epics:
1. Foundation (5 stories) - DONE
2. Core Features (8 stories) - DONE

New Epic will be: Epic 3

Please provide:
1. Epic Title: Reporting & Analytics
2. Epic Goal: Enable users to view reports and export data
3. Estimated stories: 4

Checking architecture impact...

This epic requires:
[x] New data models (Report, ExportJob)
[x] New API endpoints (/reports, /exports)
[x] New components (ReportViewer)

Updating architecture first, then PRD...

SYNC COMPLETE:
✓ docs/architecture.md updated
✓ docs/architecture/data-models.md updated
✓ docs/prd.md updated (Epic 3 added)
✓ docs/epics/epic-3.md created
✓ docs/progress.md updated

Next: /execute draft to start Story 3.1
```

---

## Example: Adding New Story

```
User: /sync story

Select epic for new story:
1. Epic 1: Foundation (5 stories)
2. Epic 2: Core Features (8 stories)
3. Epic 3: Reporting (4 stories)

> 2

New story will be: Story 2.9

Story information:
- Title: Bulk Export
- As a: admin, I want: to export multiple items, so that: I can analyze data offline
- AC: Given items selected, When export clicked, Then CSV downloads

Architecture impact: None (uses existing export service)

SYNC COMPLETE:
✓ docs/prd.md updated (Story 2.9 added)
✓ docs/epics/epic-2.md updated
✓ docs/progress.md updated

Next: /execute draft 2.9 to create story file
```

---

## Change Log Updates

All syncs automatically update Change Logs:

```markdown
| Date       | Version | Description                  | Author   |
| ---------- | ------- | ---------------------------- | -------- |
| 2024-02-15 | 1.2     | Added Epic 3: Reporting      | @planner |
| 2024-02-20 | 1.3     | Added Story 2.9: Bulk Export | @planner |
```

---

## Best Practices

1. **Sync early, sync often** - Don't let docs drift too far
2. **Architecture first** - Update technical docs before requirements
3. **Validate references** - Ensure all cross-links work
4. **Run /sync all periodically** - Weekly for active projects

---

## Workflow Details

See `.bmad-lite/tasks/sync-docs.md` for detailed workflow.

---

## Agent

This command invokes **@planner** agent with sync-docs task.
