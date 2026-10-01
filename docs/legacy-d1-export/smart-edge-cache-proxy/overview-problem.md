---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "758f4f82-d11b-45a5-8b24-00d0521ce008"
source_metadata: {"id": "758f4f82-d11b-45a5-8b24-00d0521ce008", "case_study_id": "0f118459-42e3-46e4-8383-48f84646655c", "parent_id": "0f118459-42e3-46e4-8383-48f84646655c", "title": "🌍 Overview & Problem", "slug": "overview-problem", "slug_path": "smart-edge-cache-proxy/overview-problem", "depth": 1, "nav_order": 0, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-05-03T04:52:16.474Z", "checksum": "8561bd5290be4c62107a90302f74680e8c6c608bfeba00c6975d95c82f9a5fc1", "excerpt": "Modern digital platforms are increasingly built on **API-driven architectures**, where frontend applications depend on backend services to retrieve structured data in real time.", "created_at": "2026-03-14T22:48:25.207Z", "updated_at": "2026-05-03 07:12:34", "synced_at": "2026-05-03 07:12:34"}
---
## 🌐 Context

Modern digital platforms are increasingly built on **API-driven architectures**, where frontend applications depend on backend services to retrieve structured data in real time.

While this model provides flexibility and scalability, it introduces a critical challenge:\n👉 **high-frequency, repeated access to the same underlying data**

In many cases, identical or near-identical API requests are executed multiple times across users and sessions, yet backend systems must process each request independently.

Traditional CDN caching partially addresses this problem but is primarily optimised for **static assets** (e.g., images, scripts, HTML). Dynamic APIs, however, introduce variability through:

* query parameters
* filtering logic
* data freshness requirements

As a result, conventional caching approaches often fail to deliver consistent performance improvements.

This creates a clear architectural gap between:

* **dynamic API behaviour**
* **static caching models**

---

## 🚨 Problem Statement

From an architectural perspective, several systemic issues emerge when API traffic is handled directly by origin systems without intelligent edge control.

---

### 🔹 1. Non-Deterministic Request Patterns

The same logical request can be represented in multiple formats:

`/api/deals?destination=mediterranean&duration=7`\n`/api/deals?duration=7&destination=mediterranean`

Although functionally identical, these variations result in **different cache keys**, leading to:

* duplicate cache entries
* reduced cache efficiency
* lower cache hit ratios

👉 This highlights a fundamental issue:\n**lack of deterministic request handling**

---

### 🔹 2. Excessive Origin Load

Due to inconsistent cache behaviour and conservative TTL policies:

* identical datasets are repeatedly recomputed
* backend systems perform unnecessary processing
* database queries are executed more frequently than required

This leads to:

* increased infrastructure cost
* degraded response times
* reduced system scalability

---

### 🔹 3. Static and Inefficient TTL Strategies

Traditional caching relies on fixed TTL values:

* cache for 5 minutes
* cache for 1 hour

However, API responses vary significantly in:

* size
* volatility
* business relevance

This creates a trade-off:

| Approach | Problem |
|----------|---------|
| Long TTL | Risk of stale data |
| Short TTL | Poor cache utilisation |

👉 The underlying issue is:\n**TTL policies are not aligned with data behaviour**

---

### 🔹 4. Lack of Persistent Reuse

Edge caches are **ephemeral by design**:

* entries can be evicted
* cache locality can vary
* large responses may be repeatedly regenerated

Without a persistent layer:

* expensive responses are recomputed unnecessarily
* cache efficiency degrades over time

---

### 🔹 5. Limited Operational Control

Operational teams require dynamic control over caching behaviour, including:

* cache bypass for debugging
* targeted invalidation
* TTL adjustments
* runtime diagnostics

However, many systems require:

* code changes
* redeployment
* manual intervention

👉 This creates operational friction and slows down response to issues.

---

## 💡 Architectural Insight

The core problem is not simply caching inefficiency.

It is the absence of a **centralised control layer** that governs:

* how requests are interpreted
* how cache keys are constructed
* how responses are reused
* how freshness is defined
* how behaviour is controlled at runtime

---

## 🏗️ Solution Approach

To address these challenges, the solution introduces a **programmable edge orchestration layer** using Cloudflare Workers.

Instead of treating the edge as a passive caching layer, the architecture promotes it to an **active decision-making layer**.

### High-Level Flow

`Client → Edge Worker → Edge Cache → R2 (Persistent) → Origin API`

---

## 🎯 Design Principles

The architecture is guided by three core principles:

---

### 🔹 Deterministic Request Handling

Ensure that:

* logically identical requests → identical cache keys

This maximises cache efficiency and consistency.

---

### 🔹 Multi-Tier Caching Strategy

Introduce a hierarchical model:

* ⚡ Edge Cache → low latency
* 💾 Persistent Storage (R2) → durability
* 🖥 Origin API → source of truth

---

### 🔹 Configuration-Driven Control

Externalise behaviour into **KV configuration**, enabling:

* runtime changes without redeployment
* safer operational control
* improved governance

---

## 📈 Architectural Impact

This approach fundamentally changes API delivery:

| Before | After |
|--------|-------|
| Origin handles most requests | Edge absorbs majority of traffic |
| Inconsistent caching | Deterministic caching |
| Static TTL rules | Adaptive TTL logic |
| Limited control | Runtime-configurable system |
| Reactive debugging | Built-in observability |

---

## 🧭 Transition

With the problem clearly defined and architectural principles established, the next section explores how this design is implemented in practice through the **edge-based request processing pipeline and caching layers**.

---