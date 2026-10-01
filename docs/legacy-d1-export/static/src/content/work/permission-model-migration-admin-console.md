---
title: "Permission Model Migration: From Page Flags to Capability-Based Access"
description: "Impact: Replaced brittle page-level access flags with explicit capability controls across navigation, UI actions, and API authorization paths."
date: "2025-12-04T00:00:00.000Z"
tags:
  - Access Control
  - Platform Architecture
featured: false
draft: false
---

## TL;DR
Led a permission-model migration for the admin console from legacy page allowlists to explicit capability-driven access control. The migration aligned navigation visibility, page actions, and server-side API enforcement under a unified permission contract. This reduced access drift, improved role clarity, and made future authorization changes safer to implement.

## Problem
Legacy access behavior relied heavily on page-level visibility flags and mixed assumptions between frontend and backend checks. This produced mismatch risks: users could be blocked in UI while still having server paths, or vice versa. As feature coverage expanded, permission behavior became harder to audit and maintain.

## Constraints
- Migrate without breaking critical day-to-day operational workflows.
- Preserve least-privilege behavior while reducing accidental lockouts.
- Keep “view-as” and role testing reliable for internal support use-cases.
- Ensure server-side controls remain authoritative regardless of UI state.

## Architecture
The migration introduced capability-based permission primitives and applied them consistently across the stack.

1. **Canonical permission catalog**
- Resources/actions were standardized into explicit capability keys.
- Frontend route visibility and action controls derive from readable capabilities.

2. **Server-authoritative authorization checks**
- Protected APIs validate authenticated identity and required capabilities.
- Self-read and scoped exceptions are handled explicitly where needed.

3. **Permission-aware navigation and UX**
- Sidebar, command menu, and settings navigation derive from capability-readable paths.
- High-risk actions (execute/update/delete) are independently gated from basic read access.

4. **Migration-safe compatibility path**
- Legacy data structures were retained temporarily for save compatibility.
- UI state moved to canonical capability rows as source of truth.

## Key Decisions
- **Capabilities over page toggles**
  Better expresses intent and scales with feature complexity.

- **Server checks as hard boundary**
  Prevents UI-only controls from becoming security assumptions.

- **Action-level gating model**
  Supports least privilege without overblocking read workflows.

- **Incremental cutover with validation checkpoints**
  Reduced migration risk while preserving operational continuity.

## Results
- Improved consistency between visible UI access and API authorization behavior.
- Reduced permission drift by centralizing route/action mapping contracts.
- Improved role governance with explicit action-level control surfaces.
- Improved supportability for impersonation/testing workflows during access debugging.

## Future Enhancements
- Add policy simulation tooling for pre-change impact review.
- Add permission diff audit views by role/user over time.
- Add automated tests for route/action/API authorization parity.
