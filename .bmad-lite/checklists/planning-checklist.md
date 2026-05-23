# Planning Checklist

Combined validation checklist for PRD and Architecture documents.
Use this to validate planning artifacts before moving to development.

---

## How to Use

Run through each section, marking items as:
- ✓ Pass
- ⚠️ Warning (minor issue, can proceed)
- ✗ Fail (must fix before proceeding)

---

## 1. PRD Validation

### 1.1 Goals & Context
- [ ] Goals are clear and measurable
- [ ] Background context explains the "why"
- [ ] Scope is well-defined (what's in/out)

### 1.2 Requirements
- [ ] All functional requirements have clear FR numbers
- [ ] Non-functional requirements are specific (not vague)
- [ ] No conflicting requirements
- [ ] Requirements are testable

### 1.3 Technical Assumptions
- [ ] Repository structure is specified
- [ ] Service architecture is decided with rationale
- [ ] Testing requirements are clear
- [ ] All assumptions have rationale documented

### 1.4 Epics
- [ ] Epics are logically sequential
- [ ] Epic 1 includes foundation + initial value
- [ ] Each epic delivers deployable functionality
- [ ] Cross-cutting concerns flow through epics (not at end)

### 1.5 Stories
- [ ] Stories within each epic are sequential
- [ ] Each story is a vertical slice
- [ ] Stories are sized for 2-4 hours AI agent work
- [ ] No story depends on later stories
- [ ] All stories have numbered acceptance criteria
- [ ] AC use Given-When-Then format

---

## 2. Architecture Validation

### 2.1 Tech Stack
- [ ] All technologies have specific versions
- [ ] All choices have documented rationale
- [ ] Tech stack aligns with PRD assumptions
- [ ] No conflicting technology choices

### 2.2 Data Models
- [ ] All entities from PRD are modeled
- [ ] Relationships are clearly defined
- [ ] TypeScript interfaces are provided
- [ ] Primary keys and timestamps included

### 2.3 API Specification
- [ ] All endpoints needed for stories are defined
- [ ] Authentication approach is specified
- [ ] Request/response formats are clear
- [ ] Error responses are standardized

### 2.4 Components
- [ ] Component responsibilities are clear
- [ ] Dependencies between components are mapped
- [ ] No circular dependencies

### 2.5 Security
- [ ] Authentication method is specified
- [ ] Authorization approach is defined
- [ ] Input validation strategy exists
- [ ] Secrets management is addressed

### 2.6 Testing Strategy
- [ ] Testing pyramid is defined
- [ ] Coverage targets are set
- [ ] Test organization is specified
- [ ] Testing tools are selected

### 2.7 Source Tree
- [ ] Folder structure is defined
- [ ] Naming conventions are specified
- [ ] Test locations are clear

---

## 3. Cross-Document Alignment

### 3.1 PRD → Architecture
- [ ] All PRD requirements have architecture support
- [ ] Tech stack matches PRD technical assumptions
- [ ] All epics can be implemented with defined architecture

### 3.2 Architecture → Stories
- [ ] All components have stories that use them
- [ ] Stories can reference architecture sections
- [ ] Data models support story requirements

---

## Results Summary

| Section | Status | Notes |
|---------|--------|-------|
| PRD Goals & Context | {✓/⚠️/✗} | |
| PRD Requirements | {✓/⚠️/✗} | |
| PRD Tech Assumptions | {✓/⚠️/✗} | |
| PRD Epics | {✓/⚠️/✗} | |
| PRD Stories | {✓/⚠️/✗} | |
| Arch Tech Stack | {✓/⚠️/✗} | |
| Arch Data Models | {✓/⚠️/✗} | |
| Arch API Spec | {✓/⚠️/✗} | |
| Arch Components | {✓/⚠️/✗} | |
| Arch Security | {✓/⚠️/✗} | |
| Arch Testing | {✓/⚠️/✗} | |
| Cross-Document | {✓/⚠️/✗} | |

**Overall Status:** {PASS | PASS WITH WARNINGS | FAIL}

**Issues to Address:**
1. {Issue if any}
2. {Issue if any}

**Recommendations:**
- {Recommendation if any}
