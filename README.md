# Cadence Projects — Shared Docs Setup (BMAD-Lite)

Guide for setting up a shared documentation system for the entire project using the BMAD-Lite framework.

---

## Setup Guide

### 1. Clone `project-docs` and install BMAD-Lite

```bash
# Clone the shared docs repo
git clone <project-docs-repo-url>
cd Cadence-Projects
```

Install BMAD-Lite inside `Cadence-Projects`:

```bash
npm i @ktran-1604/bmad-lite
```

### 2. Clone sub-projects

Once BMAD-Lite is installed, clone each sub-project into its corresponding folder:

```bash
git clone <backend-api-repo-url>     backend-api
git clone <employee-web-repo-url>    employee-web
git clone <employer-web-repo-url>    employer-web
git clone <superadmin-web-repo-url>  superadmin-web
```

> Each sub-project is an independent git repo cloned inside `project-docs`.

---

### 2. Add `.gitignore`

Create a `.gitignore` file at the root of `Cadence-Projects`:

```gitignore
# List sub-projects folder
/backend-api/*
/employee-web/*
/employer-web/*
/superadmin-web/*
/...

.claude
.bmad-lite
```

> This ensures sub-project code and BMAD-Lite internal files are **never committed** to the `project-docs` repo.

---

### 3. Scan each sub-project (Brownfield)

Open Claude Code inside `Cadence-Projects`, then run:

```
/BMad-Lite:bmad-scan
```

BMAD-Lite will ask you to select a sub-project (e.g. `backend-api`, `employee-web`, ...), then display the following mode options:

| # | Command | Description |
|---|---------|-------------|
| 1 | `*scan` | Full project scan (all 7 sub-scans) + generate docs |
| 2 | `*scan-arch` | Architecture scan (config, tech, structure, models, routes) |
| 3 | `*scan-prd` | Business/PRD scan (config, modules, business, routes) |
| 4 | `*quick-scan` | Lightweight scan + generate all ~22 docs in one step |
| 5 | `*gen-arch` | Generate architecture docs (~10 files) — run after `*scan-arch` |
| 6 | `*gen-prd` | Generate PRD docs (~9+ files) — run after `*scan-prd` |

**Which mode to choose?**

- **`*scan`** — full scan + generate docs in one go. Slowest but simplest.
- **`*quick-scan`** — lightweight scan to quickly grasp structure, flow, and rules. Fast, but AI will make more assumptions, so accuracy is lower.
- **`*scan-prd` → `*gen-prd` and `*scan-arch` → `*gen-arch`** — slightly slower but significantly more accurate. **Recommended.**

**Recommended scan flow (per sub-project):**

```
1. /BMad-Lite:bmad-scan  →  select sub-project  →  *scan-arch
2. /BMad-Lite:bmad-scan  →  select sub-project  →  *gen-arch
3. /BMad-Lite:bmad-scan  →  select sub-project  →  *scan-prd
4. /BMad-Lite:bmad-scan  →  select sub-project  →  *gen-prd
```

Repeat for each sub-project. Once done, review the generated files under `docs/` and edit as needed.

---

### 4. Push docs after finishing a feature

After completing a feature and updating the docs, **stage only the docs files** — never the entire directory:

```bash
# Stage docs and gitignore only — NEVER use git add .
git add docs/ .gitignore README.md

git commit -m "docs: update <feature-name> documentation"
git push
```

> **Important:** Never use `git add .` inside `project-docs` — it will accidentally stage sub-project code.

**For sub-projects**, push code as usual inside each individual repo:

```bash
cd backend-api
git add .
git commit -m "feat: ..."
git push
```

---

## Directory Structure

```
Cadence-Projects/          ← project-docs repo (shared docs)
├── docs/                  ← all documentation managed here
├── backend-api/           ← independent git repo (gitignored)
├── employee-web/          ← independent git repo (gitignored)
├── employer-web/          ← independent git repo (gitignored)
├── superadmin-web/        ← independent git repo (gitignored)
├── .gitignore
└── README.md
```
