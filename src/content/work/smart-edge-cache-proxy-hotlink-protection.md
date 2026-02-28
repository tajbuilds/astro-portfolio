---
title: "Xano Edge Cache Proxy: Deterministic Caching, R2 Tiering, and Safer Purge"
description: "Designed a Cloudflare Worker proxy that reduced origin pressure and improved cache control using KV-driven normalization, adaptive TTLs, and R2 fallback."
date: 2025-09-06
tags:
  - Cloudflare Workers
  - Edge Caching
  - R2
  - Xano
  - Security
featured: true
draft: false
github: "https://github.com/your-handle/cf-xano-edge-cache-proxy"
---

## TL;DR
I built a Cloudflare Worker in front of Xano APIs that normalizes requests, applies policy-driven cache keys, and layers edge cache with R2 for better resiliency. The proxy supports stale-on-error behavior, operator-aware TTL mode, strict endpoint gating, and deterministic key versioning for safer invalidation.

## Problem
The upstream API layer needed better protection from avoidable traffic and uneven query patterns. Existing behavior made cache efficiency inconsistent and invalidation fragile, especially across POPs and high-churn endpoints.

## Constraints
- Keep API behavior compatible for existing consumers.
- Maintain low latency while adding policy and validation logic.
- Support endpoint-specific behavior without hardcoding rules in worker code.
- Ensure purge/invalidation could be made deterministic when cache delete behavior is unreliable.

## Architecture

![Edge cache proxy request flow diagram](/diagrams/edge-cache-proxy-request-flow.svg)
*Figure: Edge request flow with KV policy, edge cache, R2 tiering, and origin fallback.*

Requests flow through a Worker route (`protected-api.example/*`) before origin fetch.

1. **Normalization and policy lookup**
- Query keys are canonicalized (lowercased, sorted, filtered).
- Endpoint config is loaded from `CFG_KV` and memoized with a small in-memory LRU.
- Global runtime policy (bypass/debug/thresholds) is also loaded from KV.

2. **Cache key derivation**
- Canonical normalized URL is used as the base cache key.
- Optional suffixes are appended for operator sync context and purge-version context.
- Hash-based keys are used for R2 object storage.

3. **Tiered cache behavior**
- Read order: edge cache -> R2 (if enabled and fresh) -> origin.
- Size-based TTL bands (from KV) determine edge cache lifetime.
- Operator-aware TTL mode can override size TTL based on operator sync policy.

4. **Resiliency and observability**
- Stale-on-error is applied for upstream failures/5xx conditions.
- Response headers expose trace/cache decisions for debugging.
- Analytics events are emitted to `WAE_METRICS` for outcome monitoring.

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
- Improved cache consistency across normalized request variants.
- Better origin protection with a two-tier cache model and stale-on-error fallback.
- Clearer operational debugging through trace headers and cache outcome metadata.
- Stronger control boundaries via strict endpoint policy gating.

> Add your concrete metrics here for portfolio impact:
> - Origin request reduction: `[xx%]`
> - Edge/R2 hit ratio change: `[from x to y]`
> - p95 latency improvement: `[xx ms / xx%]`
> - Error resilience during upstream incidents: `[brief evidence]`

## Next Improvements
- Add scheduled cleanup for superseded R2 objects after purge-version rotations.
- Extend policy validation tooling for KV config safety checks before publish.
- Add a small internal dashboard for hit/miss/stale trends by endpoint.
- Introduce automated canary rollout for major cache policy changes.



