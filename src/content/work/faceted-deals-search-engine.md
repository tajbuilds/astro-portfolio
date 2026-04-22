---
title: "Faceted Deals Search Engine: Scalable Server-Side Discovery"
description: "Designed a faceted search architecture that keeps filtering fast, results predictable, and query access securely controlled at scale."
date: "2025-11-18T00:00:00.000Z"
tags:
  - Search Engineering
  - Platform Architecture
coverImage: "/diagrams/meilisearch-search-flow-v2.svg"
featured: true
draft: false
---

## Executive Summary

Designed a server-side faceted search architecture to replace inefficient client-side filtering and improve performance, scalability, and control over query behaviour.

The system introduced a dedicated search backend using Meilisearch, combined with a proxy layer to enforce structured filtering, secure query handling, and consistent response formatting.

This enabled fast, predictable filtering across large datasets while maintaining control over how queries are executed and how results are exposed to the frontend.

---

## Problem Context

The existing search and filtering experience relied heavily on client-side logic, leading to performance issues, inconsistent results, and limited scalability as the dataset grew.

Filtering large datasets in the browser increased load times, introduced complex state management, and made it difficult to enforce consistent filtering logic across the application.

There was also limited control over how queries were constructed and executed, increasing the risk of inefficient queries and exposing unnecessary data to the frontend.

The challenge was to design a system that could handle filtering server-side, deliver fast responses, and maintain strict control over query behaviour and data exposure.

---

## Constraints

The system needed to support fast filtering across a large dataset without introducing noticeable latency.

Filtering logic had to remain consistent and predictable regardless of how the frontend was implemented.

The solution needed to prevent direct access to the search engine, ensuring all queries passed through a controlled backend layer.

The architecture needed to support multiple filter types, including categorical, numerical, and multi-select filters.

The system needed to be flexible enough to evolve without requiring major changes to the frontend implementation.

---

## Architecture Overview

The architecture introduced a dedicated search backend powered by Meilisearch, with a proxy layer acting as the only entry point for all search requests.

The frontend sends structured search requests to the proxy endpoint, which validates and transforms the request into a format compatible with the search engine.

The proxy enforces filtering rules, constructs the query, and forwards it to the search backend, ensuring that all search logic is handled server-side.

Search results are returned in a controlled format, including filtered results, total counts, and facet distributions required for UI rendering.

This approach ensures that filtering remains fast, consistent, and secure, while removing the burden of complex filtering logic from the frontend.

---

## Key Architecture Decisions

### Server-side Filtering over Client-side Logic
Filtering was moved from the frontend to the backend to improve performance, reduce complexity, and ensure consistent behaviour across all queries.

---

### Proxy Layer for Query Control
A backend proxy was introduced to control how queries are constructed and executed, preventing direct access to the search engine.

---

### Structured Query Format
A unified request structure was defined to standardise how filters, pagination, and search terms are handled.

---

### Faceted Search Model
Faceting was used to provide dynamic filter options and counts, enabling a richer and more responsive user experience.

---

### Controlled Data Exposure
Only required fields and results are returned to the frontend, reducing payload size and improving security.

---

## Trade-offs

Introducing a proxy layer added an extra step to the request flow, but provided better control and security over query handling.

Moving filtering to the backend increased server responsibility, but significantly improved performance and reduced frontend complexity.

Using a dedicated search engine introduced additional infrastructure, but enabled faster and more scalable query execution.

Standardising the query format reduced flexibility for ad-hoc queries, but ensured consistency and predictability across the system.

---

## Risks & Mitigations

Allowing direct access to the search engine could expose query logic and sensitive data structures.

This was mitigated by enforcing all requests through a backend proxy layer, ensuring controlled query construction and execution.

Incorrect or inefficient filter construction could lead to degraded performance or inconsistent results.

This was mitigated by standardising the query format and validating all incoming requests before execution.

As the dataset grows, search performance could degrade if indexing and configuration are not maintained.

This was mitigated by using a dedicated search engine designed for fast indexing and retrieval, along with controlled schema management.

Over-fetching unnecessary data could increase payload size and slow down responses.

This was mitigated by limiting returned fields and ensuring only required attributes are included in the response.

---

## Outcome & Impact

Improved filtering performance by shifting heavy computation from the browser to a dedicated search backend.

Reduced frontend complexity by removing the need for complex state management and client-side filtering logic.

Enabled fast and predictable search behaviour across large datasets through structured query handling.

Improved control over data exposure and query execution by introducing a backend proxy layer.

Created a scalable foundation for adding new filters, facets, and search capabilities without redesigning the system.

---

## My Role

Designed the overall search architecture, including backend filtering, proxy layer, and query structure.

Implemented the backend proxy responsible for validating, transforming, and forwarding search requests.

Defined the filtering model and faceted search structure to support dynamic UI behaviour.

Integrated the search backend with the frontend to ensure consistent and predictable results.

Tested and refined the system to ensure performance, accuracy, and scalability.



