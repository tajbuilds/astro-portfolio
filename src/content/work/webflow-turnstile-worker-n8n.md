---
title: "Webflow -> Turnstile -> Cloudflare Worker -> n8n Pipeline"
description: "Reduced abusive submissions while routing verified leads into automated workflows within seconds."
date: 2026-01-12
tags:
  - Cloudflare Workers
  - Turnstile
  - n8n
  - Security
featured: true
draft: false
github: "https://github.com/your-handle/turnstile-worker-n8n"
---

## TL;DR
A verification-first intake pipeline moved form submissions through Turnstile checks, Worker validation, and event-based n8n automation with clear failure handling.

## Problem
Lead forms were receiving repeated low-quality submissions and operational teams were manually filtering noise.

## Constraints
- Existing Webflow front-end had to remain intact.
- Verification had to happen before any workflow execution.
- Retries needed to avoid duplicate records.

## Architecture
Webflow form submissions were sent to a Cloudflare Worker endpoint. The Worker validated Turnstile tokens, normalized payloads, and forwarded trusted events to n8n webhooks with idempotency keys.

## Key Decisions
- Centralized verification logic at the edge for low latency.
- Added strict schema checks before forwarding to automation.
- Implemented deterministic idempotency keys from request metadata.

## Results
- Significant drop in low-quality submissions entering operations.
- Faster lead handoff from capture to CRM enrichment.
- Cleaner event audit trail for troubleshooting.

## Next Improvements
- Add adaptive risk scoring by source and behavior.
- Add dashboarding for rejection reasons and trends.
