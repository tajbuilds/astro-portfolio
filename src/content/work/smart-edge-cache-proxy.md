---
title: "Smart Edge Cache Proxy: Deterministic Caching, Tiering & Safer Purge"
description: "Impact: Lower origin pressure, predictable caching behavior, and safer purge operations with deterministic invalidation."
date: "2025-09-06T00:00:00.000Z"
tags:
  - Cloudflare Workers
  - Edge Caching
coverImage: "/diagrams/edge-cache-proxy-flow.svg"
featured: true
draft: false
externalCaseStudyUrl: "/docs/case-studies/smart-edge-cache-proxy/"
---

## TL;DR
Designed and deployed an edge cache proxy that enforced deterministic request normalization to prevent cache fragmentation and improve effective hit ratio. Cache behavior was controlled through KV policy so TTL bands, bypass rules, and endpoint behavior could be changed without redeploying code. The system used tiered caching with edge cache (`caches.default`) and an optional R2 tier for large payloads, with stale-on-error handling during upstream failures. Because physical delete behavior can be unreliable across POPs, invalidation was implemented with a purge-version suffix for deterministic, global logical refresh.

## Problem
Cache performance was inconsistent because query parameter order, casing, and tracking noise produced multiple cache keys for equivalent requests. That fragmentation lowered hit ratio and pushed avoidable traffic to origin, especially on large or frequently requested payloads. Invalidation was also an operational risk: deleting cache objects did not always produce predictable results across POPs. The architecture needed deterministic keys, policy-driven control, and safer invalidation behavior without adding latency.

## Constraints
- Keep API behavior compatible for existing consumers.
- Maintain low latency while adding policy and validation logic.
- Support endpoint-specific behavior without hardcoding rules in worker code.
- Ensure purge/invalidation could be made deterministic when cache delete behavior is unreliable.

## Architecture

### Design Principles
- Deterministic cache keys over implicit cache behavior.
- Config-driven KV policy over hardcoded rules.
- Tiered caching over a single-cache dependency.
- Logical invalidation (versioning) over physical deletes.

<figure class="diagram">
  <img
    src="/diagrams/edge-cache-proxy-flow.svg"
    alt="Edge request flow: Client -> Worker (normalization + policy) -> Edge Cache -> R2 fallback -> Origin API -> write-back + metrics."
    loading="lazy"
  />
  <figcaption>
    Edge request flow with KV policy lookup, deterministic cache keys, edge cache, R2 tiering, origin fallback, and metrics emission.
  </figcaption>
</figure>

All API traffic is routed through a Cloudflare Worker in front of `protected-api.example/*` before origin fetch.

1. **Normalization and policy lookup**
- Query keys are canonicalized (lowercased, sorted, filtered) before cache key generation.
- Endpoint config is read from `CFG_KV` and memoized with a bounded in-memory LRU.
- Runtime controls (bypass/debug/thresholds) are loaded as KV policy.

2. **Cache key derivation**
- A canonical normalized URL is used as the base cache key.
- Optional operator and purge-version suffixes are appended for deterministic behavior.
- Hash-based keying is used for R2 object storage.

3. **Tiered cache behavior**
- Read order: edge cache (`caches.default`) -> R2 tier (if enabled and fresh) -> origin.
- Adaptive TTL bands from KV policy determine edge cache lifetime by payload profile.
- Operator-aware TTL mode can override band-based TTL when policy requires it.

4. **Resiliency and observability**
- Stale-on-error is applied on upstream failures and 5xx conditions.
- Trace headers expose cache decisions for debugging and incident response.
- Analytics events are emitted to `WAE_METRICS` for operational monitoring.

## Key Decisions
- **KV-driven configuration over hardcoded rules**
  Endpoint and global behavior are externalized in KV so policy can change without redeploying code.

- **Adaptive TTL bands by payload size**
  Payload size is used to tune edge TTL, improving hit quality while avoiding one-size-fits-all cache windows.

- **R2 as persistent cache tier**
  Large successful responses are written to R2 and reused when edge cache misses, reducing repeated origin pressure.

- **Strict KV-only endpoint mode**
  `STRICT_KV_ONLY` prevents accidental origin passthrough for unconfigured paths, reducing risk in production.

- **Purge-version suffix for deterministic invalidation**
  Because `caches.default.delete()` can be unreliable in some cases, key versioning via `last_purge` was introduced to force global logical misses on demand.

## Results
- Reduced origin requests by approximately `[X-Y%]` on high-traffic endpoints by eliminating cache key fragmentation.
- Improved effective cache hit ratio from around `[A%]` to `[B%]` after deterministic normalization and KV policy alignment.
- Reduced p95 latency by roughly `[X ms]` for cache-served responses and stabilized performance during burst traffic.
- Served stale responses during upstream 5xx incidents to reduce user-facing failures and timeout cascades.
- Improved operational control with deterministic purge versioning and traceable cache decision headers.

## Future Enhancements
- Add automated cleanup for superseded R2 objects after purge-version rotations.
- Add pre-publish KV policy validation to reduce misconfiguration risk.
- Expand cache observability with endpoint-level trend views and anomaly alerts.
