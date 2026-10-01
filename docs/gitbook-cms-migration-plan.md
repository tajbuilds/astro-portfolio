# GitBook CMS Migration Plan

Status: Draft implementation plan  
Target branch: `integration/gitbook-cms-migration`  
Production branch: `main`  
Production rule: **Do not merge to `main` until the full GitBook-backed portfolio has been built, tested, reviewed, and explicitly approved.**

## 1. Goal

Replace the current documentation pipeline:

```text
Outline
  -> Outline sync worker
  -> Cloudflare D1
  -> Astro docs UI
```

with a simpler headless-CMS architecture:

```text
GitBook
  -> GitBook API
  -> Astro / Cloudflare Worker
  -> tajs.io
```

GitBook becomes the single source of truth for portfolio projects and long-form project documentation.

Astro remains responsible for the website experience: routing, layout, styling, navigation, SEO, Markdown rendering, Mermaid rendering, responsive behaviour and other presentation concerns.

The target implementation must not use an iframe and must not require manual duplication of project records inside the Astro repository.

## 2. Desired Authoring Workflow

The intended end state is:

1. Create a new project as a direct child of the configured GitBook `Projects` root.
2. Set its title, slug, description, icon and documentation hierarchy in GitBook.
3. Merge the GitBook content into the private Portfolio CMS space.
4. The project automatically appears on the Astro portfolio.
5. Project pages and child documentation routes render natively on `tajs.io`.
6. No Astro content file needs to be created manually for the project.
7. No D1 sync operation is required.
8. The same GitBook documentation remains maintainable through the GitBook integration.

## 3. Source-of-Truth Model

GitBook is the source of truth for:

- project existence
- project title
- project slug/path
- project description
- project placement beneath the configured `Projects` root
- project ordering from GitBook sibling order
- page hierarchy
- page icon where supplied

For the first implementation, hierarchy is deliberately the publication contract: a direct child of `Projects` is a portfolio project. Private authoring guidance, templates and drafts that must never be exposed by Astro live outside that tree.

Extended card metadata such as role, year, categories, technologies, featured state and media may be added later when a stable first-class GitBook representation is proven. Astro must not invent a second manually maintained project record merely to supply those fields.
- long-form documentation
- documentation hierarchy
- architecture documentation
- Mermaid source
- architecture decisions / ADRs
- updated timestamps

Astro must not maintain a second copy of this information unless a value is purely presentational.

## 4. Proposed GitBook Information Architecture

Initial convention:

```text
Portfolio
|
+-- Projects
|   |
|   +-- <Project>
|   |   +-- Overview
|   |   +-- Problem & Context
|   |   +-- Requirements
|   |   +-- Architecture
|   |   +-- Components
|   |   +-- Data Flow
|   |   +-- Integration Design
|   |   +-- Security
|   |   +-- Deployment
|   |   +-- Observability
|   |   +-- Architecture Decisions
|   |   +-- Trade-offs
|   |   +-- Lessons Learned
|   |
|   +-- <Next Project>
|
+-- Architecture Patterns
+-- ADR Library
+-- Learning
```

A direct child of the configured `Projects` root is a portfolio project.

The `Projects` hierarchy itself is the initial publication/discovery contract:

- direct children are projects;
- sibling order is display order;
- title, slug/path, description and icon come from the GitBook page tree;
- child pages form the project's architecture/documentation navigation;
- content outside `Projects` is not exposed by project discovery.

API testing showed that custom page variables and Markdown frontmatter tags are not reliably surfaced through the normal GitBook page-tree/Markdown API, so the first implementation does not depend on them.

## 5. Proposed Astro Routes

Preferred final route model:

```text
/work
/work/[project]
/work/[project]/[...slug]
```

Examples:

```text
/work/teslacam-archive-viewer
/work/teslacam-archive-viewer/architecture
/work/teslacam-archive-viewer/telemetry
/work/jet2holidays
/work/jet2holidays/api-integration
```

The current split between short project records under `/work` and long documentation under `/docs/case-studies` should only remain if testing demonstrates a real user or SEO benefit.

Existing production URLs must not be removed without a redirect plan.

## 6. Astro Responsibilities

Astro continues to own:

- site shell
- project-card design
- project listing
- project detail layout
- documentation layout
- left navigation tree
- breadcrumbs
- table of contents
- previous/next navigation
- typography
- code-block presentation
- tables
- responsive behaviour
- dark/light theme
- Mermaid rendering
- Mermaid lightbox/zoom
- images/media presentation
- SEO metadata
- sitemap generation
- error states
- caching policy

GitBook is treated as a headless content service, not as the public site renderer.

## 7. GitBook Adapter

All GitBook-specific access should be isolated behind one internal adapter instead of being scattered across Astro pages.

Proposed structure:

```text
src/lib/gitbook/
  client.ts
  projects.ts
  pages.ts
  search.ts
  mapper.ts
  types.ts
```

Desired application-facing functions:

```ts
getProjects()
getProject(projectSlug)
getProjectPages(projectSlug)
getPage(projectSlug, pagePath)
searchDocs(query)
```

Astro pages/components should consume these functions rather than depending directly on GitBook API response shapes.

This boundary also gives us a clean fallback/rollback point during migration.

## 8. Security

The GitBook API token must remain server-side.

Expected flow:

```text
Browser
  -> Astro / Cloudflare Worker
  -> GitBook API
```

Never:

```text
Browser
  -> GitBook API with secret token
```

The token must be stored as a Cloudflare secret/environment binding and must not be committed to GitHub.

## 9. Rendering

GitBook content should be fetched as structured content/Markdown where practical and rendered by Astro.

This preserves:

- native HTML
- SEO
- accessibility
- portfolio theme
- existing CSS
- existing Mermaid implementation
- existing diagram zoom behaviour
- consistent mobile behaviour

No iframe should be used for project documentation.

## 10. Caching

D1 must not be retained merely as a cache.

Initial strategy:

```text
Request
  -> Cloudflare/Astro cache
  -> cache hit: return
  -> cache miss: GitBook API
  -> render/store response
```

Start with a short TTL and keep invalidation simple.

A GitBook webhook-driven invalidation mechanism may be added later if a short TTL is not sufficient.

The cache is an optimisation, not a second content database.

## 11. Search

Current D1-backed search should ultimately be replaced by the GitBook search/content API where suitable.

The public search UI remains controlled by Astro.

Target flow:

```text
Search UI
  -> Astro search endpoint
  -> GitBook
  -> normalised results
  -> Astro UI
```

No browser-side GitBook credential exposure.

## 12. Sitemap and Discovery

The sitemap should be generated from the GitBook project/page hierarchy.

Adding a new visible GitBook project or child page should therefore automatically affect:

- `/work` project listing
- project navigation
- documentation routes
- sitemap
- search
- related navigation where applicable

No manual route registration should be required.

## 13. Existing Components to Preserve

The current implementation already contains useful presentation work that should be reused rather than rewritten unnecessarily, including:

- docs shell
- nested navigation
- current-page handling
- TOC
- previous/next controls
- Markdown presentation
- code-block styling
- tables
- Mermaid rendering
- Mermaid zoom/lightbox
- responsive documentation layout

The migration should primarily replace the data layer first.

## 14. Existing Components to Remove Eventually

Only after the GitBook replacement is validated:

- D1 documentation binding
- D1 `case_studies` dependency
- D1 `documents` dependency
- D1 `outline_collections` dependency
- D1 documentation search dependency
- documentation sync tracking
- Outline-to-D1 sync worker dependency
- manual sync workflow
- obsolete D1 schema/migration documentation
- duplicate project content under Astro, if fully replaced by GitBook

Removal happens late in the migration, not at the beginning.

## 15. Migration Strategy

### Phase 0 - Branch and safety boundary

- Keep `main` unchanged.
- Build on `integration/gitbook-cms-migration`.
- Keep the migration PR to `main` as Draft.
- Do not merge until final approval.

### Phase 1 - GitBook spike

- Connect/configure GitBook.
- Create a small representative project structure.
- Confirm API authentication from Cloudflare/Astro.
- Confirm project-tree retrieval.
- Confirm individual page retrieval.
- Confirm Markdown/structured content quality.
- Confirm Mermaid survives the content path.
- Confirm the page-tree fields needed for initial discovery are available.
- Record the hierarchy-based publication contract and defer unsupported extended metadata.
- Confirm rate limits/caching requirements.

No existing production data path is removed in this phase.

### Phase 2 - GitBook adapter

Implement `src/lib/gitbook/*`.

Create normalised internal models for:

- Project
- ProjectSummary
- DocumentationPage
- NavigationNode
- SearchResult
- Portfolio metadata

Add unit tests around API response mapping and path handling.

### Phase 3 - Parallel project discovery

Build a GitBook-backed project listing without removing the existing portfolio source.

Validate:

- ordering from GitBook sibling order
- discovery from direct children of `Projects`
- title/slug/description/icon mapping
- card rendering
- sensible behaviour when optional page fields are absent
- empty state
- API failure behaviour

### Phase 4 - Parallel documentation renderer

Feed the existing documentation UI from GitBook through the adapter.

Validate:

- root project page
- child pages
- nested child pages
- Markdown
- headings/TOC
- tables
- code blocks
- links
- images
- Mermaid
- Mermaid lightbox
- previous/next
- mobile layout

### Phase 5 - Search and sitemap

Replace/parallel-test:

- D1 search with GitBook-backed search
- D1 sitemap discovery with GitBook page-tree discovery

### Phase 6 - Route consolidation

If approved after testing, move toward:

```text
/work
/work/[project]
/work/[project]/[...slug]
```

Implement redirects from existing public documentation URLs before removing them.

### Phase 7 - Remove duplicate content model

Once GitBook-backed project discovery is proven, remove the need to create matching project content manually in Astro.

Creating a valid GitBook project should be sufficient for it to appear on the portfolio.

### Phase 8 - Remove D1 and sync worker

Only after full functional validation:

- remove D1 docs reads
- remove D1 docs search
- remove D1 docs sitemap queries
- remove D1 binding if it has no unrelated use
- retire the Outline-to-D1 sync workflow
- archive/delete obsolete code only after rollback risk is acceptable

### Phase 9 - Production readiness

Run full validation:

- formatting
- lint
- typecheck
- unit tests
- integration tests
- production build
- route testing
- redirects
- mobile
- dark/light themes
- accessibility smoke test
- SEO metadata
- sitemap
- search
- caching
- error/fallback behaviour
- cold API requests
- cached requests

Only then mark the migration PR ready for review.

## 16. Branch / PR Strategy

`main` remains production and is not used as the day-to-day migration target.

Long-lived integration branch:

```text
main
  |
  +-- integration/gitbook-cms-migration
```

For meaningful implementation units, create feature branches from the integration branch:

```text
integration/gitbook-cms-migration
  |
  +-- feat/gitbook-client
  +-- feat/gitbook-project-discovery
  +-- feat/gitbook-doc-renderer
  +-- feat/gitbook-search
  +-- feat/gitbook-routing
  +-- chore/remove-d1-docs
```

Feature PRs target:

```text
integration/gitbook-cms-migration
```

not:

```text
main
```

After each feature is tested, merge it into the integration branch.

The integration branch therefore becomes the complete candidate system.

A single umbrella Draft PR remains:

```text
integration/gitbook-cms-migration
  -> main
```

That PR must stay unmerged until the complete migration is accepted.

## 17. Why This Branching Model

This gives us:

- production isolation
- one stable place to test the complete migration
- small reviewable feature PRs
- ability to change direction without polluting `main`
- a clear final diff against production
- an explicit final go/no-go point
- simple rollback: production remains the existing `main` until final merge

## 18. Merge Gate

The final PR to `main` must not be merged simply because individual features work.

Required final conditions:

- GitBook is the confirmed source of truth.
- Creating a project in GitBook causes it to appear automatically in the portfolio.
- No duplicate Astro project entry is required for the migrated content model.
- Documentation renders natively, not through iframe.
- Project hierarchy works.
- Mermaid works.
- search works.
- sitemap works.
- cache behaviour works.
- credentials remain server-side.
- existing public links are preserved or redirected.
- all automated checks pass.
- production build passes.
- full manual acceptance testing is complete.
- D1 removal has not broken unrelated functionality.
- the migration has explicit final approval.

## 19. Rollback Principle

Until the final merge, production remains untouched.

During implementation, prefer parallel adapters and reversible changes over destructive early removal.

If a GitBook assumption proves unsuitable, the migration branch can be changed or abandoned without changing production.

After production migration, retain a documented rollback path for the first release.

## 20. First Implementation Task

The first code change after this plan should be a narrow GitBook API spike, not D1 removal.

It should prove:

1. server-side GitBook authentication,
2. retrieval of the Projects hierarchy,
3. retrieval of one representative project's Markdown/content,
4. hierarchy and core page-field mapping,
5. Mermaid source preservation,
6. error handling,
7. basic cache behaviour.

Only after that spike is successful should the broader migration begin.
