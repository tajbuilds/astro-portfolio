---
title: "Internal ML Workbench Modernization"
description: "Impact: Converted a stale AutoML app into a modular, containerized, self-hosted workbench with reproducible training and CI-backed delivery."
date: "2026-02-18T00:00:00.000Z"
tags:
  - Machine Learning
  - Platform Architecture
coverImage: "/images/work-ml-workbench.svg"
featured: true
draft: false
---

## TL;DR
Designed and deployed a full modernization of a stale, monolithic AutoML app into a modular, production-usable internal ML workbench. The rebuild replaced framework-heavy abstractions with explicit scikit-learn pipelines, added deterministic data/workspace handling, and standardized runtime behavior through Docker and environment-driven configuration. CI now enforces lint, tests, and runtime smoke checks, while image publishing to GHCR provides consistent deployment artifacts for internal teams. The result is a maintainable self-hosted platform that supports quick tabular-model workflows without fragile local setup.

## Problem
The inherited codebase was difficult to operate and evolve due to monolithic structure, unclear boundaries between UI and model logic, and limited deployment hygiene. Reproducibility was inconsistent across environments, making internal handoff and peer adoption slow. The original training path also constrained transparency around preprocessing and model-selection behavior. A modernization was needed that preserved ease of use while improving maintainability, reproducibility, and operational reliability.

## Constraints
- Preserve a low-friction user experience for non-specialist users.
- Keep the stack self-hostable for internal use (no mandatory SaaS dependency).
- Support both classification and regression from a single workflow.
- Avoid exposing internal data externally while enabling shared team usage.

## Architecture
The platform was restructured into clear application layers with explicit responsibilities:

1. **Application shell and workflow orchestration**
- Streamlit remains the UI runtime, but orchestration is now modularized through dedicated entry and step modules.
- Navigation and stage flow are separated from training logic to reduce coupling.

2. **Core ML engine (scikit-learn pipelines)**
- Replaced opaque AutoML flow with explicit preprocessing and estimator pipelines.
- Numeric/categorical preprocessing, cross-validation, model comparison, and holdout evaluation are deterministic and inspectable.

3. **State and data lifecycle management**
- Session state, dataset registry, and per-dataset artifacts are managed through dedicated core modules.
- Data and report outputs are consistently scoped under a stable app data directory.

4. **Deployment and distribution**
- Added non-root container runtime, health checks, and environment-driven compose deployment.
- Added CI for lint/test/smoke and GHCR publish workflow (`latest` on `main`, version tags on release).

## Key Decisions
- **PyCaret to native scikit-learn migration**
  Chosen to improve transparency, dependency control, and predictable behavior under maintenance.

- **Modular package structure over single-file app**
  Enforced separation between UI, state, config, and ML core to reduce regression risk and speed iteration.

- **Docker-first operational model**
  Standardized local and shared execution with explicit volume mounts for persistent datasets/reports.

- **Registry-based dataset handling**
  Added deterministic dataset IDs and registry metadata to support multi-dataset internal workflows.

- **CI + image publishing as a release gate**
  Ensured code quality and runtime sanity before delivering artifacts to peers.

## Results
- Reduced onboarding friction from ad-hoc local setup to a repeatable Docker Compose run path.
- Improved maintainability by moving from monolithic code to modular application boundaries.
- Increased model workflow reliability with explicit preprocessing, cross-validation, and holdout reporting.
- Improved deployment consistency through GHCR image publishing and versioned container tags.
- Reduced operational guesswork via health checks, environment-based config, and documented data handling.

## Future Enhancements
- Add authentication and role controls for shared internal deployments.
- Add model metadata artifacts (for example `model_card.json`) for traceability.
- Add optional experiment tracking integration for run history and comparison.
