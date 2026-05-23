# Document Sharding Task

Split a large document into multiple smaller documents based on level 2 sections.

---

## Purpose

- Split a large document into multiple smaller documents based on level 2 sections
- Create a folder structure to organize the sharded documents
- Maintain all content integrity including code blocks, diagrams, and markdown formatting

---

## Primary Method: Automatic with markdown-tree

**First, check if markdownExploder is available:**

```bash
# Check if md-tree is installed
md-tree --version
```

If the command succeeds, use automatic sharding:

```bash
# For PRD
md-tree explode docs/prd.md docs/prd

# For Architecture
md-tree explode docs/architecture.md docs/architecture

# For any document
md-tree explode [source-document] [destination-folder]
```

**What it does:**
- Automatically splits the document by level 2 sections
- Creates properly named files
- Adjusts heading levels appropriately
- Handles all edge cases with code blocks and special markdown

### Installation

If md-tree is not available:

```bash
npm install -g @kayvan/markdown-tree-parser
```

---

## Manual Method (if md-tree is not available)

### Step 1: Identify Document and Target Location

- Determine which document to shard (user-provided path)
- Create a new folder under `docs/` with the same name as the document (without extension)
- Example: `docs/prd.md` → create folder `docs/prd/`

### Step 2: Parse and Extract Sections

**CRITICAL SHARDING RULES:**

1. Read the entire document content
2. Identify all level 2 sections (## headings)
3. For each level 2 section:
   - Extract the section heading and ALL content until the next level 2 section
   - Include all subsections, code blocks, diagrams, lists, tables, etc.
   - Be extremely careful with:
     - Fenced code blocks (```) - ensure you capture the full block including closing backticks
     - A `##` inside a code block is NOT a section header
     - Mermaid diagrams - preserve the complete diagram syntax
     - Nested markdown elements
     - Multi-line content that might contain ## inside code blocks

**CRITICAL: Use proper parsing that understands markdown context. A ## inside a code block is NOT a section header.**

### Step 3: Create Individual Files

For each extracted section:

1. **Generate filename**: Convert the section heading to lowercase-dash-case
   - Remove special characters
   - Replace spaces with dashes
   - Example: "## Tech Stack" → `tech-stack.md`

2. **Adjust heading levels**:
   - The level 2 heading becomes level 1 (# instead of ##) in the new document
   - All subsection levels decrease by 1:
     - ### → ##
     - #### → ###
     - ##### → ####
     - etc.

3. **Write content**: Save the adjusted content to the new file

### Step 4: Create Index File

Create an `index.md` file in the sharded folder that:

1. Contains the original level 1 heading and any content before the first level 2 section
2. Lists all the sharded files with links:

```markdown
# Original Document Title

[Original introduction content if any]

## Sections

- [Section Name 1](./section-name-1.md)
- [Section Name 2](./section-name-2.md)
- [Section Name 3](./section-name-3.md)
...
```

### Step 5: Preserve Special Content

1. **Code blocks**: Must capture complete blocks including closing backticks

   ```language
   content
   ```

2. **Mermaid diagrams**: Preserve complete syntax:

   ```mermaid
   graph TD
   ...
   ```

3. **Tables**: Maintain proper markdown table formatting

4. **Lists**: Preserve indentation and nesting

5. **Inline code**: Preserve backticks

6. **Links and references**: Keep all markdown links intact

7. **Template markup**: If documents contain {{placeholders}}, preserve exactly

### Step 6: Validation

After sharding:

1. Verify all sections were extracted
2. Check that no content was lost
3. Ensure heading levels were properly adjusted
4. Confirm all files were created successfully

### Step 7: Report Results

Provide a summary:

```text
Document sharded successfully:
- Source: [original document path]
- Destination: docs/[folder-name]/
- Files created: [count]
- Sections:
  - section-name-1.md: "Section Title 1"
  - section-name-2.md: "Section Title 2"
  ...
```

---

## PRD Section Mapping

When sharding `docs/prd.md`, expect these sections based on template:

| Template Section ID | Expected H2 Title | Output Filename |
|---------------------|-------------------|-----------------|
| goals-context | Goals and Background Context | `goals-and-background-context.md` |
| requirements | Requirements | `requirements.md` |
| ui-goals | User Interface Design Goals | `user-interface-design-goals.md` |
| technical-assumptions | Technical Assumptions | `technical-assumptions.md` |
| epic-list | Epic List | `epic-list.md` |
| epic-details | Epic 1: ... (repeatable) | `epic-1-*.md`, `epic-2-*.md`, etc. |
| checklist-results | Checklist Results Report | `checklist-results-report.md` |
| next-steps | Next Steps | `next-steps.md` |

---

## Architecture Section Mapping

When sharding `docs/architecture.md`, expect these sections based on template:

| Template Section ID | Expected H2 Title | Output Filename |
|---------------------|-------------------|-----------------|
| introduction | Introduction | `introduction.md` |
| high-level-architecture | High Level Architecture | `high-level-architecture.md` |
| tech-stack | Tech Stack | `tech-stack.md` |
| data-models | Data Models | `data-models.md` |
| components | Components | `components.md` |
| external-apis | External APIs | `external-apis.md` |
| core-workflows | Core Workflows | `core-workflows.md` |
| rest-api-spec | REST API Spec | `rest-api-spec.md` |
| database-schema | Database Schema | `database-schema.md` |
| source-tree | Source Tree | `source-tree.md` |
| infrastructure-deployment | Infrastructure and Deployment | `infrastructure-and-deployment.md` |
| error-handling-strategy | Error Handling Strategy | `error-handling-strategy.md` |
| coding-standards | Coding Standards | `coding-standards.md` |
| test-strategy | Test Strategy and Standards | `test-strategy-and-standards.md` |
| security | Security | `security.md` |
| checklist-results | Checklist Results Report | `checklist-results-report.md` |
| next-steps | Next Steps | `next-steps.md` |

---

## Important Notes

- Never modify the actual content, only adjust heading levels
- Preserve ALL formatting, including whitespace where significant
- Handle edge cases like sections with code blocks containing ## symbols
- Ensure the sharding is reversible (could reconstruct the original from shards)
- Skip empty sections (don't create empty files)
- Keep original file intact (don't delete source)
