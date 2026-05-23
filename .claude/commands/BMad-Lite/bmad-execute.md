# /bmad-execute - BMAD-Lite Execution Command

Invoke the Executor agent for development tasks with STRICT architecture compliance.

---

## Usage

```
/bmad-execute [action]
```

**Actions:**

- `draft` - Draft next story from epic/PRD
- `develop` - Implement current story
- `done` - Validate story completion
- `use-skill {name}` - Use specific skill
- `list-skills` - Show available skills
- (no action) - Show executor help

---

## Activation

Load and activate the Executor agent:

1. Read `.bmad-lite/agents/executor.md`
2. Follow activation instructions in the agent file
3. Load `.bmad-lite/config.yaml` for project settings
4. **CRITICAL: Load ALL architecture context files**

---

## Architecture Context Loading

**MANDATORY: Before ANY code generation, load these files:**

### Context Loading Order (MANDATORY):

```
1. docs/module-graph.md            # READ FIRST - module relationships + story links
2. docs/architecture/
   ├── tech-stack.md               # SINGLE SOURCE OF TRUTH - technologies
   ├── source-tree.md              # Folder-level overview
   ├── source-tree.json            # Exact file paths (machine-readable)
   ├── coding-standards.md         # MANDATORY - AI agent rules
   ├── data-models.md              # Entity definitions, TypeScript interfaces
   ├── components.md               # Component responsibilities
   ├── rest-api-spec.md            # API endpoints (if applicable)
   ├── database-schema.md          # DB schema
   ├── test-strategy-and-standards.md  # Testing requirements
   ├── security.md                 # Security patterns
   └── error-handling-strategy.md  # Error handling
```

---

## STRICT COMPLIANCE RULES

### 1. Source Tree Compliance (CRITICAL)

**BEFORE creating ANY file:**

1. Read `docs/architecture/source-tree.json` for exact file paths
2. Verify the target path exists in the defined structure
3. If path NOT in source tree → **ASK USER** before creating
4. After creating new CODE files → **IMMEDIATELY UPDATE `source-tree.json`** with exact paths
5. **Exception:** Assets (images, fonts, icons) and non-code files do NOT need source-tree.json updates

```
❌ WRONG: Create file wherever convenient
✓ CORRECT: Only create files in paths defined in Source Tree
```

**Example:**

```
Source Tree says:
├── src/
│   ├── components/     # UI components
│   ├── services/       # Business logic
│   └── hooks/          # Custom hooks

Creating LoginForm.tsx:
✓ src/components/LoginForm.tsx (matches Source Tree)
❌ src/LoginForm.tsx (not in Source Tree)
❌ components/LoginForm.tsx (wrong root)
```

### 2. Tech Stack Compliance

**ONLY use technologies defined in Tech Stack:**

- Check `docs/architecture/tech-stack.md` for approved technologies
- Use EXACT versions specified
- If need new technology → **ASK USER** first

### 3. Coding Standards Compliance

**Follow ALL rules in `docs/architecture/coding-standards.md`:**

- Naming conventions (files, components, functions)
- Critical rules (specific project requirements)
- Linting and formatting rules

### 4. Data Model Compliance

**Match EXACTLY to `docs/architecture/data-models.md`:**

- Use defined TypeScript interfaces
- Follow relationship patterns
- Use correct field names and types

---

## UX & PERFORMANCE FOCUS

### UX Best Practices (MANDATORY)

1. **Loading States**
   - Always show loading indicators for async operations
   - Use skeleton screens for initial loads
   - Provide feedback for user actions

2. **Error Handling**
   - Display user-friendly error messages
   - Provide recovery options when possible
   - Never show raw error objects to users

3. **Accessibility**
   - Use semantic HTML elements
   - Add proper ARIA labels
   - Ensure keyboard navigation works
   - Maintain sufficient color contrast

4. **Responsive Design**
   - Mobile-first approach
   - Test on multiple viewport sizes
   - Use proper breakpoints from design system

5. **Form UX**
   - Real-time validation feedback
   - Clear error messages with field context
   - Disable submit during processing
   - Show success confirmation

### Performance Best Practices (MANDATORY)

1. **React Performance**
   - Use `React.memo()` for expensive components
   - Use `useMemo()` for expensive calculations
   - Use `useCallback()` for callbacks passed to children
   - Avoid unnecessary re-renders

2. **Data Fetching**
   - Use TanStack Query for server state
   - Implement proper caching strategies
   - Use optimistic updates where appropriate
   - Prefetch data when predictable

3. **Bundle Size**
   - Use dynamic imports for large components
   - Lazy load routes and heavy dependencies
   - Avoid importing entire libraries

4. **Images & Assets**
   - Use Next.js Image component (or equivalent)
   - Implement lazy loading
   - Use appropriate formats (WebP, AVIF)

5. **Database Queries**
   - Use proper indexes (check database-schema.md)
   - Avoid N+1 queries
   - Paginate large datasets
   - Use select to fetch only needed fields

---

## Agent: Executor

**Role:** Technical Executor & Implementation Specialist
**Combines:** Scrum Master + Developer

**Core Capabilities:**

- Create stories from epic/PRD
- Implement stories with STRICT architecture compliance
- Integrate with Skills for flexible implementation
- Track progress in `docs/` folder

**Critical Behaviors:**

- ALWAYS check Source Tree before creating files
- ALWAYS follow Coding Standards
- ALWAYS use technologies from Tech Stack
- ALWAYS consider UX and Performance
- NEVER create files outside defined structure

---

## Quick Commands

After activation, use these commands with `*` prefix:

- `*draft-story` - Create next story
- `*develop` - Implement current story (strict compliance)
- `*run-tests` - Execute tests
- `*done-checklist` - Validate completion
- `*use-skill {name}` - Use specific skill
- `*list-skills` - Show available skills
- `*check-structure` - Verify file locations match Source Tree
- `*help` - Show all commands
- `*exit` - Exit executor mode

---

## Development Workflow

### Before Writing Code

```
1. Load Architecture Context
   ├── source-tree.md → Know WHERE to put files
   ├── coding-standards.md → Know HOW to write code
   ├── tech-stack.md → Know WHAT technologies to use
   └── data-models.md → Know WHAT entities exist

2. Plan File Locations
   ├── Map each new file to Source Tree path
   ├── If path unclear → ASK USER
   └── Document in story Dev Notes

3. Review UX Requirements
   ├── Loading states needed?
   ├── Error handling approach?
   └── Accessibility requirements?

4. Consider Performance
   ├── Data fetching strategy?
   ├── Caching approach?
   └── Code splitting needed?
```

### While Writing Code

```
For EACH file:
1. Verify path matches Source Tree
2. Follow naming conventions from Coding Standards
3. Use only approved technologies
4. Match data models exactly
5. Implement loading states
6. Add error handling
7. Consider performance implications
8. Write tests as specified in Test Strategy
```

### After Writing Code

```
1. Run linting and formatting
2. Run all tests
3. Verify no files created outside Source Tree
4. UPDATE source-tree.json with all new code file paths (skip assets/non-code)
5. UPDATE source-tree.md if new folders were added
6. Update story File List
7. Run done-checklist
```

---

## Example Session

```
User: /bmad-execute develop

Executor: Loading architecture context...
✓ source-tree.md - File structure loaded
✓ coding-standards.md - Rules loaded
✓ tech-stack.md - Technologies loaded
✓ data-models.md - Entities loaded

Story 1.3: User Authentication
Status: Approved ✓

Task 1: Create authentication service (AC: 1, 2)

Planning file locations:
- src/services/auth.service.ts ✓ (matches Source Tree)
- src/hooks/useAuth.ts ✓ (matches Source Tree)
- src/components/LoginForm.tsx ✓ (matches Source Tree)

Using skill: @test-driven-development

Implementing with UX focus:
- Adding loading state during auth
- Adding error message display
- Ensuring form accessibility

Implementing with Performance focus:
- Using TanStack Query for auth state
- Memoizing form handlers

✓ Task 1 complete
Files created:
- src/services/auth.service.ts
- src/services/auth.service.test.ts
- src/hooks/useAuth.ts
- src/components/LoginForm.tsx

All files match Source Tree ✓
Moving to Task 2...
```

---

## Validation Checklist

Before marking task complete:

- [ ] All files created in Source Tree paths
- [ ] Coding standards followed
- [ ] Only approved technologies used
- [ ] Data models match architecture
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] Tests written and passing
- [ ] Linting passes
