# Repo Task Memory

Last updated: 2026-04-22

## Repo Snapshot

- Astro portfolio for tajs.io.
- Deployed on Cloudflare Workers.
- Content includes portfolio pages, work case studies, docs pages, and mobile/API endpoints.
- Repo uses Astro Content Collections plus some runtime-backed docs/content routes.

## Key Files

- `README.md` - high-level project and deployment notes.
- `docs/portfolio-spec.md` - product/spec reference.
- `src/lib/data/portfolio-data.ts` - shared portfolio data access layer.
- `src/content/work/*` - short work case studies.
- `src/pages/docs/*` - docs routes.

## Current Notes

- `docs/codes.md` did not exist before this file was created.
- Homepage featured case study summaries were updated on 2026-04-22.
- Only the `description` frontmatter in the four featured work entries was changed.
- Homepage text refinements were completed on 2026-04-22.
- Removed duplicate `Outcome:` text from flagship cards and updated the homepage heading copy.
- `smart-edge-cache-proxy.md` now has a new top-of-file Solutions Architect section scaffold.
- `smart-edge-cache-proxy.md` received exact predefined content for Executive Summary, Problem Context, Key Architecture Decisions, and Trade-offs.

## Next Step

- Wait for the next concrete task, then inspect only the files needed for that work.
