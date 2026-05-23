# /bmad-shard - BMAD-Lite Document Sharding Command

Split large documents into standardized sections based on templates.

---

## Usage

```
/bmad-shard prd          # Shard PRD → docs/prd/
/bmad-shard architecture # Shard Architecture → docs/architecture/
/bmad-shard <filepath>   # Shard custom document
```

---

## Activation

Load the shard-doc task:
1. Read `.bmad-lite/tasks/shard-doc.md` for complete sharding instructions
2. Read `.bmad-lite/config.yaml` for sharding configuration
3. Follow the template-based sharding process

---

## Primary Method: md-tree (Automatic)

First, try using the md-tree command:

```bash
# For PRD
md-tree explode docs/prd.md docs/prd

# For Architecture
md-tree explode docs/architecture.md docs/architecture

# For any document
md-tree explode [source-document] [destination-folder]
```

If md-tree is not available, install it:

```bash
npm install -g @kayvan/markdown-tree-parser
```

---

## Manual Method (if md-tree unavailable)

### Sharding Process

1. **Parse document** - Identify all H2 sections
2. **For each H2 section:**
   - Extract content until next H2
   - Convert heading to filename (kebab-case)
   - Adjust heading levels (## → #, ### → ##, etc.)
   - Write to file
3. **Create index.md** with links to all sections
4. **Report results**

### Critical Parsing Rules

- `##` inside code blocks is NOT a section header
- Preserve complete code blocks including closing backticks
- Preserve Mermaid diagrams completely
- Maintain all formatting and whitespace

---

## Expected Output

### For PRD (`/bmad-shard prd`)

Splits `docs/prd.md` into `docs/prd/` folder:

```
docs/prd/
├── index.md                          # Title + section links
├── goals-and-background-context.md   # Goals, Background, Change Log
├── requirements.md                   # FR + NFR requirements
├── user-interface-design-goals.md    # UX/UI specifications
├── technical-assumptions.md          # Tech stack decisions
├── epic-list.md                      # Epic summary
├── epic-1-*.md                       # Epic 1 stories
├── epic-2-*.md                       # Epic 2 stories
├── checklist-results-report.md       # Planning validation
└── next-steps.md                     # Next agent prompts
```

### For Architecture (`/bmad-shard architecture`)

Splits `docs/architecture.md` into `docs/architecture/` folder:

```
docs/architecture/
├── index.md                          # Title + section links
├── introduction.md                   # Intro, Starter, Change Log
├── high-level-architecture.md        # Summary, Diagram, Patterns
├── tech-stack.md                     # SINGLE SOURCE OF TRUTH
├── data-models.md                    # Entities, TypeScript interfaces
├── components.md                     # Component responsibilities
├── external-apis.md                  # External integrations
├── core-workflows.md                 # Sequence diagrams
├── rest-api-spec.md                  # OpenAPI specification
├── database-schema.md                # Tables, indexes, ERD
├── source-tree.md                    # Folder structure
├── infrastructure-and-deployment.md  # Cloud, CI/CD
├── error-handling-strategy.md        # Error model, logging
├── coding-standards.md               # AI agent directives
├── test-strategy-and-standards.md    # Testing pyramid
├── security.md                       # Auth, validation
├── checklist-results-report.md       # Validation results
└── next-steps.md                     # Development prompts
```

---

## Example Session

```
User: /bmad-shard prd

Claude: Sharding docs/prd.md...

Attempting md-tree explode...

Document sharded successfully:
- Source: docs/prd.md
- Destination: docs/prd/
- Files created: 10

  ✓ index.md
  ✓ goals-and-background-context.md
  ✓ requirements.md
  ✓ user-interface-design-goals.md
  ✓ technical-assumptions.md
  ✓ epic-list.md
  ✓ epic-1-foundation.md
  ✓ epic-2-core-features.md
  ✓ checklist-results-report.md
  ✓ next-steps.md
```

---

## Why Shard Documents?

1. **Better navigation** - Jump directly to relevant section
2. **Reduced context** - Load only needed sections for AI
3. **Easier updates** - Edit individual sections without full doc
4. **Team collaboration** - Different owners per section
5. **Version control** - Track changes per section

---

## Important Notes

- Never modify content, only adjust heading levels
- Preserve ALL formatting including whitespace
- Handle code blocks containing ## symbols correctly
- Sharding is reversible (can reconstruct original from shards)
- Skip empty sections (don't create empty files)
- Keep original file intact (don't delete source)
