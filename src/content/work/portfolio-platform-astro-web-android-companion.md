---
title: "Portfolio Platform: Astro Web + Android Companion"
description: "Impact: Unified web and mobile delivery using a shared API contract, resilient caching strategy, and release-ready engineering across both clients."
date: "2026-03-20T00:00:00.000Z"
tags:
  - Platform Architecture
  - Android
featured: false
draft: false
---

## TL;DR
Built the portfolio as a multi-client platform instead of a single website: an Astro web application on Cloudflare plus a native Android companion app backed by the same mobile API contract. The web app provides content and operational endpoints, while the Android app consumes `/api/mobile/*` with typed models, cache freshness windows, and offline fallback behavior. This approach keeps product behavior consistent across clients while allowing each surface to use platform-appropriate UX and runtime optimizations.

## Problem
A standalone website was not enough to demonstrate end-to-end platform thinking across client surfaces. The goal was to run the portfolio as a production-style system where web and mobile clients share data contracts, versioning expectations, and reliability patterns. Without that structure, each client would drift in content behavior, caching policy, and release quality.

## Constraints
- Keep website and mobile app aligned on the same content model and response shape.
- Support low-friction updates on web while preserving stable mobile consumption patterns.
- Handle intermittent connectivity on mobile without degrading user experience.
- Keep deployment and release workflows practical for a solo-operated platform.
- Avoid overcomplicating architecture for a portfolio-scale project.

## Architecture
The platform is split into three layers: content + APIs, web client, and Android client.

1. **Web platform layer (Astro + Cloudflare)**
- Portfolio site and case-study pages are served through Astro on Cloudflare runtime.
- Mobile-focused API endpoints expose normalized payloads for home, work, details, about, and contact flows.
- Content and route behavior remain centrally managed in one codebase.

2. **Android client layer (native app)**
- Native app built with Jetpack Compose and navigation architecture.
- Data access uses Retrofit + Gson and stores cache blobs in Room for local resilience.
- Repository layer validates API version compatibility before persisting payloads.

3. **Shared contract and cache strategy**
- Both clients consume the same conceptual content model, reducing duplication and drift.
- Mobile cache freshness windows are tuned by surface type (home/work vs detail vs static info pages).
- Stale cached responses remain usable as a fallback when network fetch fails.

## Key Decisions
- **Single platform, two clients**
  Treating web and Android as one product system creates stronger consistency and maintainability.

- **API-first mobile consumption**
  Android reads dedicated mobile endpoints rather than scraping web UI output.

- **Repository + local cache discipline**
  Cache freshness and fallback behavior are explicit, not incidental.

- **Version-aware envelope validation**
  Client rejects incompatible API major versions early to prevent silent data breakage.

- **Production-style release posture**
  Build, test, signing, and release mechanics are treated as part of the architecture, not an afterthought.

## Results
- Established a coherent multi-surface portfolio platform with one backend contract and two client experiences.
- Reduced content drift risk by centralizing data contracts and endpoint ownership in the web platform.
- Improved mobile resilience via local caching and stale-data fallback behavior.
- Enabled repeatable web deployment and mobile release workflows with clearer operational boundaries.
- Demonstrated full-stack product engineering beyond a static portfolio implementation.

## Future Enhancements
- Add contract-level schema tests to detect breaking API changes before release.
- Introduce lightweight sync status telemetry across web and mobile clients.
- Expand offline UX states with explicit stale-age messaging on more screens.
- Add release channel automation for staged Android rollouts.
