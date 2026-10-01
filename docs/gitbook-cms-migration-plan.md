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

The intended end state is that ordinary portfolio content changes happen in GitBook without requiring an Astro code change.

1. Create a new project as a direct child of the configured GitBook `Projects` root.
2. Set its title, slug, description, icon, project tags and documentation hierarchy in GitBook.
3. Add the reserved `showcase` tag when the project should be eligible for homepage showcase placement.
4. Merge the GitBook content into the private Portfolio CMS space.
5. The project automatically appears on `/work`, its public tag filters, sitemap and project routes.
6. Showcase projects automatically populate the homepage according to the website's presentation limit and GitBook sibling order.
7. Project pages and child documentation routes render natively on `tajs.io`.
8. No Astro project record, homepage slug list, tag registry or D1 content row needs to be created manually.
9. No documentation sync operation is required.

A website code change should only be needed for presentation or product behaviour changes, for example changing the homepage from two showcase cards to three. Changing which projects are showcased, adding a project, changing its title/description, changing its public tags or adding documentation sections must be CMS-only operations.

## 3. Source-of-Truth Model

GitBook is the single source of truth for portfolio content and portfolio classification:

- project existence
- project title
- project slug/path
- project description
- project placement beneath the configured `Projects` root
- project ordering from GitBook sibling order
- project icon where supplied
- project-root tags
- homepage showcase eligibility
- page hierarchy
- long-form documentation
- architecture documentation
- Mermaid source
- architecture decisions / ADRs
- updated timestamps when exposed reliably by the API

The publication contract is hierarchy-based: a direct child of `Projects` is a public portfolio project. Private authoring guidance, templates and drafts that must never be exposed by Astro live outside that tree.

Project-root tags have two roles:

- the reserved tag `showcase` is an internal presentation control and is not displayed as a public project tag;
- all other supported project-root tags are public portfolio taxonomy and drive card labels and `/work/tags/[tag]` filtering.

Showcase ordering is deterministic. Astro applies the website presentation rule, such as showing at most two homepage projects, while the selected projects come from GitBook and retain GitBook sibling order. Project names or slugs must never be hard-coded into homepage selection logic.

Astro must not maintain a second manually curated project registry, homepage project list, tag registry or documentation copy. Values that are purely presentational may remain in Astro.

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

The `Projects` hierarchy is the publication/discovery contract:

- direct children are projects;
- sibling order is display order and showcase precedence;
- title, slug/path, description, icon and tags come from the GitBook page tree;
- child pages form the project's architecture/documentation navigation;
- content outside `Projects` is not exposed by project discovery.

GitBook page tags are the project metadata mechanism for the first production model. The adapter owns reserved-tag interpretation so presentation controls such as `showcase` do not leak into public taxonomy. The implementation must use the API fields actually returned by GitBook rather than Markdown frontmatter or a second Astro-side metadata file.

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

The final public portfolio hierarchy is `/work`. The current split between short project records under `/work` and long documentation under `/docs/case-studies` is migration-only and should be removed after route cutover.

Temporary `/work/cms-preview/*` routes remain `noindex` until the final public routes are ready.

Existing production URLs must not be removed without permanent redirects. Legacy `/docs/case-studies/<project>/...` URLs should redirect to the equivalent `/work/<project>/...` route so bookmarks and search-engine signals are preserved.

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
getShowcaseProjects(limit)
getProjectTags()
getProjectsByTag(tag)
getProject(projectSlug)
getProjectPages(projectSlug)
getPage(projectSlug, pagePath)
searchDocs(query)
```

The normalized project model should expose public tags and derived showcase state so homepage, work listing, tag routes, sitemap, search and mobile/API consumers all use the same data contract.

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

Adding or editing a visible GitBook project should therefore automatically affect:

- homepage showcase when the reserved `showcase` tag is present
- `/work` project listing
- public project tags
- `/work/tags/[tag]` filtering
- project navigation
- project/documentation routes
- sitemap
- search
- mobile/API project payloads where applicable
- related navigation where applicable

No manual route registration, homepage slug list or tag registration should be required.

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

Only after every consumer has migrated to the GitBook portfolio model:

- temporary `/work/cms-preview/*` routes
- migration-only GitBook project card components
- legacy `/docs` reader routes after permanent redirects are active
- D1 documentation binding
- D1 `case_studies` dependency
- D1 `documents` dependency
- D1 `outline_collections` dependency
- D1 documentation search dependency
- documentation sync tracking
- Outline-to-D1 sync worker dependency
- manual sync workflow
- obsolete D1 schema/migration documentation
- static `src/content/work` project content after homepage, work, tags, sitemap and mobile/API consumers no longer depend on it
- Astro content-schema fields that exist only for the legacy work collection

Removal happens late in the migration and only when repository search confirms there are no remaining consumers.

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

### Phase 5 - Portfolio metadata contract

Promote project-root GitBook metadata into the normalized portfolio model.

Implement and validate:

- public project tags from GitBook page tags
- reserved `showcase` tag handling
- deterministic showcase order from GitBook sibling order
- exclusion of reserved tags from public taxonomy
- unique project-tag discovery
- project filtering by tag
- request-local hierarchy reuse where it avoids redundant API calls

No homepage or tag route should contain hard-coded project names or slugs.

### Phase 6 - Migrate portfolio discovery surfaces

Move content-driven portfolio surfaces to the GitBook model:

- homepage showcase
- `/work` project listing
- `/work/tags/[tag]`
- reusable project-card inputs

The homepage keeps its Astro-owned presentation limit, but project selection comes entirely from GitBook metadata.

### Phase 7 - Route consolidation

Promote GitBook-backed content to the final public route model:

```text
/work
/work/[project]
/work/[project]/[...slug]
```

Remove migration-only UI distinctions between GitBook projects and legacy projects.

Temporary `/work/cms-preview/*` routes remain `noindex` until cutover and are removed after validation.

### Phase 8 - Search and sitemap

Replace/parallel-test:

- D1 search with GitBook-backed search
- static/D1 sitemap discovery with GitBook project/page/tag discovery

The sitemap must contain final public `/work` routes and must not publish temporary preview routes.

### Phase 9 - Mobile/API migration

Move mobile and other API consumers from the Astro work collection to the normalized GitBook project model.

Validate payload compatibility and explicitly document any public contract changes before removing the legacy collection.

### Phase 10 - Legacy route redirects

Add permanent redirects from legacy documentation URLs to the final `/work` hierarchy.

Examples:

```text
/docs/ -> /work/
/docs/case-studies/<project>/ -> /work/<project>/
/docs/case-studies/<project>/<page>/ -> /work/<project>/<page>/
```

Validate redirect status codes, nested paths and canonical metadata before deleting the legacy route implementation.

### Phase 11 - Remove duplicate content model and D1 documentation path

Only after all consumers use GitBook:

- remove static `src/content/work` project records
- remove obsolete work collection/schema dependencies
- remove D1 docs reads
- remove D1 docs search
- remove D1 docs sitemap queries
- remove D1 binding if it has no unrelated use
- retire the Outline-to-D1 sync workflow
- remove legacy `/docs` implementation while preserving redirects
- remove migration-only CMS preview code

Repository search must confirm that no runtime consumer still depends on removed sources.

### Phase 12 - Production readiness and UI pass

Run full validation:

- formatting
- lint
- typecheck
- unit tests
- integration tests
- production build
- route testing
- redirects
- homepage showcase behaviour
- tag discovery/filtering
- mobile/API payloads
- dark/light themes
- responsive/mobile
- accessibility smoke test
- SEO metadata
- sitemap
- search
- caching
- error/fallback behaviour
- cold API requests
- cached requests

Complete the dedicated UI/UX polish after the content architecture and route model are stable.

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

- GitBook is the confirmed source of truth for portfolio projects, classification and long-form content.
- Creating a project in GitBook causes it to appear automatically in the portfolio.
- Adding/removing the reserved `showcase` tag controls homepage eligibility without a code change.
- Adding/removing a public project tag updates tag discovery and filtering without a code change.
- No duplicate Astro project entry, homepage slug list or tag registry is required.
- Documentation renders natively, not through iframe.
- Project hierarchy works.
- Mermaid works.
- final `/work` routes are indexable and use correct canonical metadata.
- search works.
- sitemap works and excludes temporary preview routes.
- mobile/API consumers no longer depend on removed legacy project content.
- cache behaviour works.
- credentials remain server-side.
- existing public links are preserved or redirected.
- legacy D1/static portfolio sources have no remaining runtime consumers before removal.
- all automated checks pass.
- production build passes.
- full manual acceptance testing is complete.
- the migration has explicit final approval.

## 19. Rollback Principle

Until the final merge, production remains untouched.

During implementation, prefer parallel adapters and reversible changes over destructive early removal.

If a GitBook assumption proves unsuitable, the migration branch can be changed or abandoned without changing production.

After production migration, retain a documented rollback path for the first release.

## 20. Current Implementation Focus

The GitBook API spike, project discovery proof and shared documentation reader are complete on the migration path.

The next implementation slice is the portfolio metadata contract:

1. map GitBook project-root tags into the normalized project summary;
2. derive `showcase` from the reserved project tag;
3. expose only non-reserved tags as public taxonomy;
4. add adapter helpers for showcase selection, tag discovery and tag filtering;
5. preserve deterministic GitBook sibling order;
6. add focused unit tests;
7. validate the adapter before migrating homepage or tag-route consumers.

After that contract is proven, migrate homepage and `/work` discovery surfaces before removing any legacy data source.
