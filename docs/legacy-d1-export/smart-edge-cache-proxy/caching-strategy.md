---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "358cf6b8-0098-4ea7-b794-a15e9d7679cf"
source_metadata: {"id": "358cf6b8-0098-4ea7-b794-a15e9d7679cf", "case_study_id": "0f118459-42e3-46e4-8383-48f84646655c", "parent_id": "0f118459-42e3-46e4-8383-48f84646655c", "title": "⚡ Caching Strategy", "slug": "caching-strategy", "slug_path": "smart-edge-cache-proxy/caching-strategy", "depth": 1, "nav_order": 2, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-05-03T06:05:02.352Z", "checksum": "3b89d06f81114e17396a64101b1e21236f7cbf466801f835a3d39bb665bc2bc0", "excerpt": "The caching strategy was designed not just to improve performance, but to:", "created_at": "2026-03-14T22:48:23.867Z", "updated_at": "2026-05-03 07:12:34", "synced_at": "2026-05-03 07:12:34"}
---
# ⚡ Caching Strategy & Behaviour

## 🎯 Architectural Intent

The caching strategy was designed not just to improve performance, but to:

* maximise cache efficiency
* minimise unnecessary origin calls
* align caching behaviour with data characteristics
* introduce control and predictability into request handling

👉 Key principle:

> Caching should be **intentional and data-aware**, not generic.

---

## 🧠 Core Strategy Overview

The system implements a **multi-layer, deterministic caching model**:

```text
Request → Normalisation → Cache Key → Edge Cache → R2 → Origin → Cache Write
```

---

## 🔑 Deterministic Cache Keys

### ❗ Problem

Without control, logically identical requests produce different cache entries due to:

* parameter ordering
* casing differences
* tracking parameters

---

### ✅ Solution: Request Normalisation

All incoming requests are transformed to:

* lowercase query keys
* remove irrelevant parameters
* enforce consistent ordering

👉 Example:

```text
/api/deals?duration=7&destination=mediterranean
/api/deals?destination=mediterranean&duration=7
```

➡️ Both resolve to a **single canonical cache key**

---

### 🧠 Architectural Impact

* significantly improves cache hit rate
* reduces duplicate cache entries
* ensures predictable behaviour

---

## ⚡ Multi-Layer Cache Strategy

The system uses a **tiered cache hierarchy**:

| Layer | Role | Characteristics |
|-------|------|-----------------|
| Edge Cache | Primary | ultra-fast, ephemeral |
| R2 Storage | Secondary | persistent, durable |
| Origin API | Fallback | authoritative source |

---

### 🔁 Cache Resolution Flow

```text
1. Check Edge Cache  
2. If MISS → Check R2  
3. If MISS → Call Origin  
4. Store response (Edge + optional R2)  
```

---

### 🧠 Why This Matters

* reduces origin dependency
* improves reliability during cache eviction
* supports reuse of expensive responses

👉 Key insight:

> Speed alone is not enough — persistence matters.

---

## ⏱ Adaptive TTL Strategy

### ❗ Problem

Static TTL policies create trade-offs:

* long TTL → stale data
* short TTL → poor cache utilisation

---

### ✅ Solution: Dynamic TTL Logic

TTL is determined based on:

* response size
* data type
* endpoint configuration

---

### 🧠 Behaviour Example

| Response Type | TTL Strategy |
|---------------|--------------|
| Small / volatile | short TTL    |
| Large / stable | longer TTL   |
| Config-driven endpoints | custom TTL rules |

---

### 🧠 Architectural Benefit

* balances freshness vs performance
* aligns caching with real data lifecycle
* improves overall cache efficiency

---

## 🧾 Cache Eligibility Rules

Not all responses are cached.

### Criteria include:

* request method (GET only)
* response status (e.g. 200 OK)
* payload characteristics
* endpoint configuration

👉 This prevents:

* caching invalid responses
* storing unnecessary data

---

## 🧠 Persistent Cache (R2 Strategy)

R2 is used selectively for:

* large payloads
* expensive responses
* infrequently changing datasets

---

### 💡 Design Rationale

* edge cache alone is insufficient for durability
* persistent storage avoids repeated recomputation

---

### ⚖️ Trade-Off

| Benefit | Cost |
|---------|------|
| improved reliability | added complexity |
| reduced origin load | storage management |

---

## 🔄 Cache Invalidation Strategy

The system supports:

* manual purge endpoint
* version-based invalidation (`last_purge`)

---

### 🧠 Why Important

* ensures stale data can be cleared
* avoids full system resets
* supports operational control

---

## 🛟 Stale Response Handling

When origin fails:

* serve stale cache if available

---

### 🧠 Architectural Principle

> Prefer availability over strict freshness in failure scenarios

---

## 🔍 Observability & Debugging

The system includes:

* debug headers (`X-Trace`, etc.)
* cache status visibility
* request path transparency

---

### 🧠 Benefit

* faster debugging
* easier validation
* improved operational confidence

---

## ⚙️ Configuration-Driven Control

Caching behaviour is externalised via KV:

* TTL policies
* endpoint rules
* debug flags
* bypass controls

---

### 🧠 Architectural Benefit

* runtime flexibility
* no redeployment required
* safer experimentation

---

## 🧠 Key Architectural Characteristics

---

### ✔ Deterministic

Consistent request → consistent cache behaviour

---

### ✔ Adaptive

TTL and caching align with data behaviour

---

### ✔ Layered

Multiple cache tiers for speed + persistence

---

### ✔ Controlled

Configuration-driven behaviour

---

### ✔ Observable

Transparent and debuggable system

---

## 📈 Why This Strategy Works

This approach:

* maximises cache efficiency
* reduces origin load
* improves response times
* maintains control over data freshness
* supports operational flexibility

👉 In simple terms:

> "It transforms caching from a passive optimisation into an actively managed system."

---

## 🧭 Transition

With caching behaviour defined, the next section explores **lessons learned and architectural insights**, including how real-world behaviour influenced design improvements.

---

# 🧠 What I Improved

* turned "features" → **design reasoning**
* added **architect-level language**
* simplified explanation for interview delivery
* added **clear cause → solution → impact flow**

---