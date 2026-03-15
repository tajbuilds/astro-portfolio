---
title: "Faceted Deals Search Engine: Scalable Server-Side Discovery"
description: "Impact: Sub-second filtering, deterministic faceting, and secure query routing across 50k+ products."
date: "2025-11-18T00:00:00.000Z"
tags:
  - Meilisearch
  - Faceted Search
  - Server-Side Filtering
  - Secure Proxy
  - Travel Tech
coverImage: "/diagrams/meilisearch-search-flow-v2.svg"
featured: true
draft: false
---

## TL;DR
Designed and deployed a server-side faceted search architecture to replace fragile client-side filtering for a large travel deals catalog. The solution introduced structured indexing, deterministic filter logic, a secure proxy layer, and a unified query contract between UI and search services. This reduced browser workload, stabilized filtering behavior, and improved scalability for catalogs at `50k+` records. Search moved from UI-side patching to infrastructure-level control.

## Problem
Discovery was constrained by browser-side filtering over a growing deals dataset. Query parameter combinations produced inconsistent behavior, sorting became harder to trust, and multi-filter interactions created noticeable UI and CPU overhead. Facet distribution logic also became difficult to maintain as product volume expanded. At `50k+` records, incremental frontend optimization would not address the structural bottleneck.

## Constraints
- Support large product volumes with fast multi-facet filtering.
- Keep sensitive search credentials out of the browser.
- Preserve predictable filtering and sorting behavior across complex combinations.
- Keep query behavior consistent while allowing backend evolution.

## Architecture
Search was restructured into four layers: UI, query contract, secure proxy, and Meilisearch index execution.

<figure class="diagram">
  <img
    src="/diagrams/meilisearch-search-flow-v2.svg"
    alt="Search flow: Browser UI sends a unified request to a secure proxy, which validates payloads, builds deterministic filters, queries the search index, and returns shaped results."
    loading="lazy"
  />
  <figcaption>
    Unified search architecture with secure proxy validation, deterministic filter construction, and structured response shaping.
  </figcaption>
</figure>

1. **Structured search index**
- Product data was normalized into filter-ready attributes with stable IDs.
- Index shape was designed for deterministic faceting and explicit sort behavior.
- Index design allows future ranking, synonym, and analytics enhancements.

2. **Deterministic filter logic**
- Filter composition follows strict semantics: `OR` within a facet group, `AND` across groups.
- Filter expressions are built server-side to eliminate ambiguous UI-side logic.
- Facet distribution is recalculated per query to reflect current filter state.

3. **Unified query contract**
- The UI sends one consistent payload: query, page, page size, selected facets, requested facet distribution, sort rule, and retrieval attributes.
- Contract stability reduced frontend branching and integration drift.
- Backend query behavior can evolve without breaking UI components.

4. **Secure proxy execution path**
- All search traffic flows through a proxy endpoint before reaching Meilisearch.
- Proxy keeps credentials server-side, validates filter/sort input, and restricts returned fields.
- Responses are intentionally compact (`hits`, `estimatedTotalHits`, `facetDistribution`).

## Key Decisions
- **ID-based filtering over label-based filtering**
  Reduced ambiguity and improved long-term data consistency.

- **Server-side filter construction**
  Centralized query rules and removed logic duplication across UI code paths.

- **Single search endpoint + unified payload**
  Simplified integration and reduced coupling between UI and search internals.

- **Response shaping to essential attributes**
  Reduced payload bloat and improved rendering performance.

- **Facet shortlist governance**
  Prevented UI overload while preserving high-value discovery dimensions.

## Results
- Achieved sub-second filtering behavior at approximately `50k+` indexed travel products in normal query paths.
- Reduced client CPU load and DOM churn by moving filtering and facet distribution to server-side execution.
- Improved effective filter consistency by enforcing deterministic `OR-within / AND-across` logic.
- Stabilized sorting and pagination behavior through explicit server-side query construction.
- Created a scalable search foundation for relevance tuning, analytics, and hybrid discovery workflows.

## Future Enhancements
- Run controlled ranking experiments by query cohort.
- Expand synonym and typo-tolerance tuning with quality gates.
- Add query analytics dashboards and caching for common filter combinations.




