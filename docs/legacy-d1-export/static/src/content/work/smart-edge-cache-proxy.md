---
title: "Smart Edge Cache Proxy: Deterministic Caching, Tiering & Safer Purge"
description: "Reworked edge caching strategy to reduce origin dependence, improve cache consistency, and enable safer, deterministic invalidation."
date: "2025-09-06T00:00:00.000Z"
tags:
  - Cloudflare Workers
  - Edge Caching
coverImage: "/diagrams/edge-cache-proxy-flow.svg"
featured: true
draft: false
---

## Executive Summary

Redesigned the edge caching layer to eliminate cache fragmentation, reduce unnecessary origin traffic, and improve consistency of cached responses across environments.

The solution introduced deterministic cache key normalisation, a KV-driven policy layer for runtime control, and a version-based invalidation strategy to avoid unreliable purge behaviour across distributed edge locations.

This resulted in improved cache hit rates, reduced origin dependency, and safer, more predictable cache invalidation without requiring frequent redeployments.

## Problem Context

The existing caching approach relied on default edge behaviour, which resulted in significant cache fragmentation due to query parameter variance and inconsistent request patterns.

Multiple logically identical requests were being cached separately, reducing cache efficiency and increasing origin load. In addition, cache invalidation relied on purge mechanisms that were not consistently reliable across distributed edge locations.

This led to:

* Lower cache hit rates than expected
* Increased origin requests under load
* Difficulty ensuring consistent cache invalidation
* Limited control over caching behaviour at runtime

## Constraints

The solution needed to operate within an existing API surface without breaking compatibility for current consumers.

Latency had to remain low, meaning additional processing for normalization and policy evaluation could not introduce noticeable delay at the edge.

Caching behaviour needed to be configurable at runtime without requiring redeployment of the Worker, to support operational flexibility.

Different endpoints required different caching strategies, but this needed to be handled without hardcoding logic into the Worker.

Cache invalidation needed to be reliable and deterministic, even in cases where edge cache deletion behaviour could not be guaranteed across all locations.

## Architecture Overview

(Add placeholder text - do not generate content)

## Key Architecture Decisions

### Deterministic Cache Key Normalisation

Cache keys were normalised to remove non-essential query variance, ensuring that logically identical requests map to the same cache entry.

This improved cache hit rates and reduced duplication across the cache layer.

---

### KV-driven Policy Layer

A KV-based configuration layer was introduced to control TTLs, bypass rules, and caching behaviour without requiring code changes or redeployments.

This allowed runtime flexibility and safer operational control over caching decisions.

---

### Version-based Cache Invalidation

Instead of relying on direct purge operations, a versioning strategy was implemented within cache keys.

By incrementing a version identifier, cached content could be effectively invalidated without depending on inconsistent purge propagation across edge locations.

---

### Tiered Storage with R2 Fallback

An optional R2-backed storage layer was introduced to provide persistent caching for larger responses or fallback scenarios.

This reduced repeated origin fetches for cacheable but infrequently accessed resources.

## Trade-offs

Deterministic key normalisation introduced additional processing overhead per request, but this was justified by the significant improvement in cache efficiency and reduced origin load.

Using KV for policy control introduced eventual consistency, meaning configuration updates are not instantly reflected globally. This was accepted in exchange for runtime flexibility and operational simplicity.

Version-based invalidation increased key management complexity, but provided a more reliable and deterministic alternative to direct purge mechanisms.

Introducing R2 as a secondary storage layer added architectural complexity, but enabled better handling of large or less frequently accessed content.

## Risks & Mitigations

KV eventual consistency could result in temporary mismatch between configuration updates and runtime behaviour.

This was mitigated by designing policies that tolerate short propagation delays and avoiding rapid successive changes to critical configuration values.

Cache key normalization introduced the risk of unintentionally merging distinct requests.

This was mitigated by carefully defining which query parameters were considered non-essential and validating behaviour against real request patterns.

Version-based invalidation introduced the risk of stale data accumulation in storage layers.

This was mitigated by controlling version increments and planning for cleanup of superseded cache entries.

Introducing an R2 fallback layer increased system complexity and potential failure points.

This was mitigated by making R2 optional and ensuring the system could fall back cleanly to origin when needed.

## Outcome & Impact

Reduced unnecessary origin requests by eliminating cache fragmentation and ensuring consistent cache key usage across equivalent requests.

Improved effective cache hit rate by consolidating duplicate cache entries and aligning caching behaviour with actual request patterns.

Stabilised response times under load by increasing the proportion of responses served from edge cache.

Reduced operational risk by replacing unreliable purge behaviour with deterministic version-based invalidation.

Enabled faster operational changes by allowing cache policies to be updated at runtime without requiring code deployments.

## My Role

Designed the overall caching architecture, including normalization strategy, policy layer, and invalidation approach.

Implemented the core Cloudflare Worker responsible for request normalization, cache handling, and policy enforcement.

Defined the KV configuration model to enable runtime control over caching behaviour.

Validated system behaviour under different request patterns and failure scenarios to ensure reliability.

Iterated on the design based on observed performance and operational requirements.

## Full Implementation Detail

A deeper breakdown of implementation, configuration, and supporting components is available below.

[Read Full Case Study →](/docs/case-studies/smart-edge-cache-proxy/)
