---
title: "Webflow -> Turnstile -> Edge Worker Pipeline"
description: "Impact: Reduced abusive submissions with verification-first edge routing, safer forwarding, and request-level observability."
date: 2026-01-12
tags:
  - Cloudflare Workers
  - Turnstile
  - Verification
  - Secure Routing
  - Observability
coverImage: "/diagrams/turnstile-edge-worker-flow.svg"
featured: true
draft: false
---

## TL;DR
Designed and deployed a verification-first Cloudflare Worker in front of Webflow form submissions to enforce trust before processing. The Worker rejects invalid request shapes early, verifies Webflow authenticity with signature and timestamp checks, validates Turnstile server-side, and forwards only sanitized payloads to downstream workflows. Routing and secrets are resolved from central configuration with short-lived caching, so multi-site form behavior can be controlled without hardcoding. Structured metrics and optional block capture provide clear operational visibility into allow, block, and error paths. The result is a hardened submission pipeline that reduces spam, improves routing control, and keeps frontend complexity low.

## Problem
Public forms attracted repeated abuse that polluted lead pipelines and increased manual operational cleanup. Unverified requests could attempt to reach downstream workflows directly, and per-form routing logic became harder to manage across domains. Inconsistent controls also made troubleshooting difficult because failure causes were not clearly observable by stage. The system needed a single enforcement layer that would stop bad traffic early and allow only verified, authentic submissions to proceed.

## Constraints
- Preserve compatibility with existing Webflow submission behavior.
- Keep sensitive verification and routing secrets out of the client.
- Support deterministic multi-domain, multi-form routing.
- Maintain low latency while adding signature and token validation.

## Architecture
A Cloudflare Worker acts as the controlled gateway for form traffic before automation or downstream processing.

<figure class="diagram">
  <img
    src="/diagrams/turnstile-edge-worker-flow.svg"
    alt="Turnstile submission flow: User to Worker guards, config lookup, host and signature checks, server-side Turnstile verification, sanitized forward, and metrics/capture paths."
    loading="lazy"
  />
  <figcaption>
    Verification-first form pipeline with guard-stage blocking, config-driven routing, authenticity checks, server-side Turnstile validation, sanitized forwarding, and observability.
  </figcaption>
</figure>

### Flow
1. **Cheap guards first**
- Accept only `POST` with expected JSON wrapper shape.
- Reject oversized payloads and malformed requests before any external call.

2. **Derive routing identity**
- Extract host/domain and normalize form name to a deterministic slug.
- Build a stable lookup identity: `domain + form_slug`.

3. **Load central config (cached)**
- Fetch route config, allowlisted hostnames, and per-domain/per-form verification settings.
- Cache lookups briefly in-memory to reduce repeated control-plane calls.

4. **Verify Webflow authenticity**
- Validate signature headers using HMAC-SHA256 over `timestamp:rawBody`.
- Enforce a short timestamp window to reduce replay risk.

5. **Verify Turnstile server-side**
- Call `siteverify` with secret and token before forwarding.
- Block failed verification paths from reaching downstream systems.

6. **Sanitize and forward**
- Remove sensitive fields such as Turnstile token and debug echoes.
- Forward only required payload fields with trace-safe request identifiers.

7. **Observe outcomes**
- Emit structured timings and stage/reason codes for `ALLOW`, `BLOCK`, and `ERROR`.
- Optionally capture blocked submissions with a constrained schema for investigation.

## Key Decisions
- **Trust-before-processing at the edge**
  Validation and authenticity checks happen before workflow execution.

- **Deterministic domain + form routing identity**
  Normalized lookup keys reduce routing drift across sites.

- **Configuration-driven control**
  Routing and verification settings are managed centrally, not hardcoded in worker logic.

- **Server-side Turnstile verification**
  Keeps secrets off the client and prevents token bypass patterns.

- **Sanitized forwarding contract**
  Downstream systems receive only vetted fields with traceability headers.

- **Operationally useful telemetry**
  Stage-level timing and reason codes make incident diagnosis faster.

## Results
- Reduced abusive submissions reaching downstream workflows by enforcing verification at the edge.
- Improved routing consistency across multiple websites/forms through deterministic config-driven lookup.
- Lowered operational cleanup effort by blocking invalid and spoofed requests before automation.
- Improved troubleshooting speed with stage-coded metrics and optional block capture.
- Increased confidence in submission integrity by combining authenticity checks with server-side token verification.

## Future Enhancements
- Add stronger replay controls with short-lived nonce tracking where needed.
- Tighten per-form host/action binding policies.
- Add route-level rate limiting and adaptive challenge escalation.
- Expand dashboards for block-reason trends and targeted form monitoring.


