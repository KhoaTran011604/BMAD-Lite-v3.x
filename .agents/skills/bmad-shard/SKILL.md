---
name: bmad-shard
description: Invokes the document sharding tool to split single comprehensive monolithic documents into structured folder sections using markdown-tree-parser or manual parsing.
---

# /bmad-shard - BMAD-Lite Document Sharding

Use this skill to split large, single-file documents (like a greenfield `prd.md` or `architecture.md`) into modular, sharded sections under dedicated subfolders (`docs/prd/` and `docs/architecture/`).

---

## When to Use This Skill
- After finishing initial monolith documentation during Greenfield phases and migrating to V3 distributed execution.
- When any document grows too long to read or maintain easily as a single file.

---

## Usage Actions
Invoke the skill with `/bmad-shard [target]` or execute actions using the `*` prefix:

| Action | Description |
|---|---|
| **`prd`** | Shard `docs/prd.md` into the `docs/prd/` folder |
| **`architecture`** | Shard `docs/architecture.md` into the `docs/architecture/` folder |
| **`{filepath}`** | Shard a custom markdown file by H2 headings |

---

## 🚀 SHARDING METHODOLOGY

### Primary Method: md-tree (Automatic)
First, attempt to run the `md-tree` command:
```bash
# For PRD
md-tree explode docs/prd.md docs/prd

# For Architecture
md-tree explode docs/architecture.md docs/architecture
```
*If `md-tree` is not installed on the system, run this command to install it globally:*
```bash
npm install -g @kayvan/markdown-tree-parser
```

### Manual Method (Fallback)
If `md-tree` is not available, execute manual parsing:
1. **Identify H2 Headings:** Parse the document to extract all `##` sections (exclude `##` signs that reside inside code blocks).
2. **Chunk Sections:** Extract content between consecutive H2 headings. Keep code blocks and Mermaid diagrams fully intact.
3. **Format Filenames:** Convert H2 headers to kebab-case names (e.g. `## User Interface Design Goals` → `user-interface-design-goals.md`).
4. **Shift Heading Levels:** Adjust internal headings so they shift up (## becomes #, ### becomes ##, #### becomes ###).
5. **Create index.md:** Write an `index.md` file listing descriptions and clickable markdown links to all sharded files.

---

## 🔒 CRITICAL PARSING RULES
- Keep original source files completely intact (do not delete the source monolith file until instructed by `/bmad-plan vert-to-v3`).
- Preserve all spacing, text, code block boundaries, and whitespace.
- All sharded outputs must be written in **English**.
