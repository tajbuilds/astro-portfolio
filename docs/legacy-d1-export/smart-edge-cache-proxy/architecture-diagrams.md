---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "d55f3bf8-6747-4227-8b5b-ff9a83736076"
source_metadata: {"id": "d55f3bf8-6747-4227-8b5b-ff9a83736076", "case_study_id": "0f118459-42e3-46e4-8383-48f84646655c", "parent_id": "0f118459-42e3-46e4-8383-48f84646655c", "title": "🧩 Architecture Diagrams", "slug": "architecture-diagrams", "slug_path": "smart-edge-cache-proxy/architecture-diagrams", "depth": 1, "nav_order": 4, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-05-03T13:39:14.243Z", "checksum": "2f36695b1c8837048758183f093b7517830a4799187c642756f211d2ab5fc8ba", "excerpt": "Visual diagrams are an essential part of architecture documentation because they allow complex systems to be understood quickly. While the written sections of this documentation explain how the Smart Edge Cache Proxy beh", "created_at": "2026-03-14T22:48:24.653Z", "updated_at": "2026-05-03 15:08:51", "synced_at": "2026-05-03 15:08:51"}
---
## 🧭 Introduction

Visual diagrams are an essential part of architecture documentation because they allow complex systems to be understood quickly. While the written sections of this documentation explain how the Smart Edge Cache Proxy behaves, diagrams illustrate how the different components interact and how requests flow through the system.

This section provides a collection of architectural diagrams that describe the major structural and behavioural aspects of the Smart Edge Cache Proxy. These diagrams complement the explanations provided in the architecture, caching, and operations sections of this case study.

Each diagram focuses on a specific aspect of the system, such as request processing, caching hierarchy, configuration behaviour, or observability.

---

# 🌐 Context Diagram

The context diagram shows where the Smart Edge Cache Proxy sits within the broader system architecture.

Client Applications\n        │\n        ▼\nCloudflare Edge Network\n        │\n        ▼\nSmart Edge Cache Proxy (Worker)\n        │\n        ▼\nBackend APIs / Origin Services

The proxy acts as an intermediary layer that interprets requests, manages caching behaviour, and controls interactions with backend APIs.

**Purpose of this diagram**

• Defines system boundaries\n• Shows external dependencies\n• Establishes the role of the proxy in the architecture

# 🏗 High-Level Architecture

This diagram shows the main architecture of the Smart Edge Cache Proxy. The Cloudflare Worker acts as the edge orchestration layer between the client and the origin API. It uses KV for configuration, Edge Cache for low-latency responses, and R2 as a persistent cache tier before falling back to the origin API.

```mermaid
graph LR
  A[Client / Webflow / Browser] -->|GET API Request| B[Cloudflare Edge Worker]

  B --> C[KV Configuration]
  B --> D[Edge Cache]
  B --> E[R2 Persistent Cache]
  B --> F[Origin API<br/>web.fredolsentravel.cloud]

  D -->|Cache HIT| R[Return Response]
  D -->|Cache MISS| E
  E -->|R2 HIT| R
  E -->|R2 MISS| F

  F --> B
  B -->|Cache + Return| R
  R --> A
```

---

# 🔁 Cache Decision Flow — Detailed Runtime Logic

This diagram shows the detailed runtime decision path used by the worker. It explains how the system handles bypass mode, endpoint configuration, strict validation, TTL selection, edge cache lookup, optional R2 fallback, origin fetch, and cache write behaviour.

The purpose of this diagram is to make cache behaviour explicit and predictable, which is important when operating a configurable caching layer in production.

```mermaid
flowchart TB
  Client[Client Request]
  Worker[Cloudflare Edge Smart Cache Worker]

  Bypass{Bypass Enabled?}
  LoadCfg[Load Endpoint Config From KV]
  Strict{Strict KV Only<br/>and No Config?}
  Normalize[Normalize URL]
  Validate{Required Input Valid?}
  CacheOff{Endpoint Cache Disabled?}
  OpMode{Use Operator TTL?}

  OpLoad[Load Operator TTL Policy From KV]
  OpTTL[Compute Operator TTL]
  Bands[Load Global Size TTL Bands]
  SizeTTL[Compute Size-Based TTL]

  EdgeHit{Edge Cache Hit?}
  R2Allowed{R2 Allowed<br/>and KV Config Exists?}
  R2Read[Read From R2]
  R2Fresh{Fresh R2 Object?}

  Origin[Fetch From Origin]
  Analyze[Analyze Response]
  Cacheable{Cacheable Status?<br/>200 or 404}
  EdgeStore[Store In Edge Cache]
  R2Write{Large Enough<br/>for R2?}
  WriteR2[Write To R2]

  RespBlocked[Return 412 Blocked]
  RespBadReq[Return 400 Missing Required Input]
  RespHit[Return Edge Hit]
  RespR2[Return R2 Hit]
  RespPass[Return Pass Through]
  RespMiss[Return Origin Response<br/>With Cache Headers]

  Client --> Worker
  Worker --> Bypass

  Bypass -->|Yes| Origin
  Bypass -->|No| LoadCfg

  LoadCfg --> Strict
  Strict -->|Yes| RespBlocked
  Strict -->|No| Normalize

  Normalize --> Validate
  Validate -->|No| RespBadReq
  Validate -->|Yes| CacheOff

  CacheOff -->|Yes| RespPass
  CacheOff -->|No| OpMode

  OpMode -->|Yes| OpLoad
  OpLoad --> OpTTL
  OpTTL --> EdgeHit

  OpMode -->|No| Bands
  Bands --> SizeTTL
  SizeTTL --> EdgeHit

  EdgeHit -->|Yes| RespHit
  EdgeHit -->|No| R2Allowed

  R2Allowed -->|Yes| R2Read
  R2Allowed -->|No| Origin

  R2Read --> R2Fresh
  R2Fresh -->|Yes| RespR2
  R2Fresh -->|No| Origin

  Origin --> Analyze
  Analyze --> Cacheable

  Cacheable -->|No| RespPass
  Cacheable -->|Yes| EdgeStore

  EdgeStore --> R2Write
  EdgeStore --> RespMiss

  R2Write -->|Yes| WriteR2
  R2Write -->|No| RespMiss
  WriteR2 --> RespMiss
```

# 🔄 Full Runtime Sequence — Exceptions and Failure Paths

This sequence diagram shows the normal request lifecycle through the Smart Edge Cache Proxy. The worker loads endpoint rules from KV, normalises the request, checks the edge cache, falls back to R2 when available, and only contacts the origin API when no cached response can be reused.

The purpose of this view is to explain the main interaction pattern without including every operational exception.

```mermaid
sequenceDiagram
    participant U as Client
    participant W as Edge Worker
    participant K as KV Config
    participant C as Edge Cache
    participant R as R2 Cache
    participant O as Origin API

    U->>W: GET API request
    W->>K: Load endpoint configuration
    K-->>W: Endpoint rules and TTL settings

    W->>W: Normalise request and build cache key

    W->>C: Check edge cache
    alt Edge cache hit
        C-->>W: Cached response
        W-->>U: Return response with cache headers
    else Edge cache miss
        W->>R: Check R2 persistent cache

        alt R2 hit
            R-->>W: Persistent cached response
            W->>C: Repopulate edge cache
            W-->>U: Return R2 response
        else R2 miss
            W->>O: Fetch from origin API
            O-->>W: Origin response

            W->>W: Analyse response and compute TTL
            W->>C: Store in edge cache

            opt Large response and R2 enabled
                W->>R: Store persistent copy
            end

            W-->>U: Return origin response with cache headers
        end
    end
```

# 🧭 Cache Processing States — Runtime Behaviour

This state diagram shows the runtime states the worker can move through while processing a request. It is useful for understanding the different outcomes produced by the proxy, including bypass, pass-through, blocked requests, edge cache hits, R2 hits, stale fallback, and origin misses.

Unlike the sequence diagram, which focuses on interaction between components, this diagram focuses on the internal state transitions inside the worker.

```mermaid
stateDiagram-v2
    [*] --> InspectRequest

    InspectRequest --> Bypass : bypass enabled
    InspectRequest --> Passthrough : non-GET method
    InspectRequest --> GetRequestFlow : GET method

    Bypass --> ReturnBYPASS
    Passthrough --> ReturnDIRECT

    state GetRequestFlow {
        [*] --> LoadConfig

        LoadConfig --> Blocked : strict KV only + no config
        LoadConfig --> NormalizeRequest : config found or strict off

        Blocked --> ReturnBLOCKED

        NormalizeRequest --> BadRequest : required input missing
        NormalizeRequest --> CacheDisabled : cache_enabled = false
        NormalizeRequest --> LookupEdgeCache : valid cacheable request

        BadRequest --> ReturnBADREQ
        CacheDisabled --> ReturnPASS

        LookupEdgeCache --> EdgeHit : cache hit
        LookupEdgeCache --> EdgeMiss : cache miss

        EdgeHit --> ReturnHIT

        EdgeMiss --> CheckR2Eligibility

        CheckR2Eligibility --> FetchOrigin : R2 not allowed
        CheckR2Eligibility --> CheckR2 : R2 allowed

        CheckR2 --> ServeR2 : fresh object found
        CheckR2 --> FetchOrigin : stale or not found

        ServeR2 --> ReturnMISS_R2

        FetchOrigin --> OriginError : fetch error
        FetchOrigin --> Origin5xx : origin 5xx
        FetchOrigin --> AnalyzeResponse : origin 200 / 404 / other

        OriginError --> ReturnSTALE : stale fallback found
        OriginError --> ReturnERROR : no fallback

        Origin5xx --> ReturnSTALE : stale edge found
        Origin5xx --> ReturnPASS5XX : no stale fallback

        AnalyzeResponse --> CacheabilityCheck

        CacheabilityCheck --> ReturnPASS : not cacheable
        CacheabilityCheck --> ComputeTTL : cacheable response

        ComputeTTL --> StoreEdgeCache
        StoreEdgeCache --> MaybeStoreR2
        MaybeStoreR2 --> ReturnMISS
    }

    ReturnBYPASS --> [*]
    ReturnDIRECT --> [*]
    ReturnBLOCKED --> [*]
    ReturnBADREQ --> [*]
    ReturnPASS --> [*]
    ReturnHIT --> [*]
    ReturnMISS_R2 --> [*]
    ReturnSTALE --> [*]
    ReturnPASS5XX --> [*]
    ReturnERROR --> [*]
    ReturnMISS --> [*]
```

---

# 🧱 Logical Components — Edge Orchestration Layer

This diagram shows the logical components within the edge orchestration layer. The Edge Worker coordinates request processing, using a normalisation component to ensure deterministic cache keys, a configuration store to apply runtime policies, and a multi-layer cache strategy consisting of edge and persistent storage before falling back to the origin service.

The goal of this design is to separate concerns clearly while keeping the system flexible, configurable, and scalable.

```mermaid
classDiagram
    class EdgeWorker {
        +fetch(request)
        +handleRequestFlow()
        +applyPolicies()
    }

    class RequestNormalizer {
        +normalizeUrl()
        +buildCacheKey()
    }

    class ConfigStore {
        +getEndpointConfig()
        +getTTLPolicies()
    }

    class EdgeCache {
        +match()
        +put()
        +getStale()
    }

    class PersistentCache {
        +read()
        +write()
        +isEligible()
    }

    class OriginService {
        +fetch()
    }

    EdgeWorker --> RequestNormalizer : normalises requests
    EdgeWorker --> ConfigStore : loads policies
    EdgeWorker --> EdgeCache : primary cache
    EdgeWorker --> PersistentCache : secondary cache
    EdgeWorker --> OriginService : fallback source
```

# 🗃️ Logical Runtime Data Model

This model helps explain the logical objects involved in request processing. A raw request is first normalised, then converted into a deterministic cache key. That key is used to resolve possible cached responses from the edge cache or R2. If no cached response exists, the origin response is analysed and assigned a TTL decision before being stored or returned.

The diagram is useful for technical audiences because it shows the relationship between configuration, cache identity, TTL policy, and response handling.

```mermaid
erDiagram
    REQUEST ||--o{ QUERY_PARAM : contains
    REQUEST ||--|| NORMALIZED_REQUEST : becomes
    NORMALIZED_REQUEST ||--|| CACHE_KEY : generates
    NORMALIZED_REQUEST }o--|| ENDPOINT_CONFIG : governed_by
    NORMALIZED_REQUEST }o--|| ORIGIN_TARGET : forwards_to

    CACHE_KEY ||--o| EDGE_CACHE_ENTRY : resolves_to
    CACHE_KEY ||--o| R2_OBJECT : resolves_to

    RESPONSE ||--|| RESPONSE_HEADERS : includes
    RESPONSE ||--|| RESPONSE_BODY : includes
    RESPONSE }o--|| TTL_DECISION : assigned_by

    GLOBAL_CONFIG ||--o{ TTL_BAND : defines
    GLOBAL_CONFIG ||--o{ OPERATOR_POLICY : defines
    ENDPOINT_CONFIG }o--|| GLOBAL_CONFIG : inherits_from

    EDGE_CACHE_ENTRY }o--|| RESPONSE : stores
    R2_OBJECT }o--|| RESPONSE : persists
    ORIGIN_TARGET ||--o{ RESPONSE : returns

    REQUEST {
        string method
        string raw_url
        boolean bypass_enabled
    }

    QUERY_PARAM {
        string name
        string value
    }

    NORMALIZED_REQUEST {
        string normalized_url
        boolean kv_driven
        boolean required_input_valid
    }

    CACHE_KEY {
        string cache_key
        string path
        string tenant
        string prefix
        string purge_version
        string operator_suffix
    }

    ENDPOINT_CONFIG {
        string kv_key
        boolean cache_enabled
        boolean emit_headers
        boolean use_operator_ttl
    }

    GLOBAL_CONFIG {
        string tenant
        string prefix
        boolean strict_kv_only
        boolean r2_enabled
    }

    TTL_BAND {
        integer lte_kb
        integer ttl_s
    }

    OPERATOR_POLICY {
        string operator_id
        boolean daily
        boolean weekly
        boolean monthly
        integer operator_last_sync
    }

    TTL_DECISION {
        string ttl_source
        integer edge_ttl_seconds
        boolean zero_items
        integer size_bytes
    }

    EDGE_CACHE_ENTRY {
        datetime stored_at
        integer ttl_seconds
        boolean stale_available
    }

    R2_OBJECT {
        string r2_key
        integer size_bytes
        datetime uploaded_at
        string operator_id
        integer operator_last_sync_ms
    }

    ORIGIN_TARGET {
        string host
        string path
    }

    RESPONSE {
        integer status
        integer size_bytes
        boolean zero_items
        boolean cacheable
    }

    RESPONSE_HEADERS {
        string worker_cache
        string cache_key
        string ttl_source
        string trace
    }

    RESPONSE_BODY {
        string content_type
        boolean streamed
    }
```

# 🌍 Delivery Path — Browser, Edge and Origin

```mermaid
flowchart TD
  U[User Browser] --> BROWSER[Browser Cache]
  BROWSER -->|MISS or expired| POP[Closest Cloudflare POP]

  subgraph EDGE_POP[Cloudflare Edge POP]
    POP --> W[Smart Edge Cache Proxy Worker]
    W --> EDGE_CACHE[Edge Cache]
  end

  W --> BYPASS{Bypass Enabled?}

  BYPASS -->|Yes| DIRECT[Fetch Origin Directly]
  DIRECT --> RESP_BYPASS[Return no-store Response]

  BYPASS -->|No| CFG[Load Endpoint Config]
  CFG --> NORMALISE[Normalise Request]
  NORMALISE --> VALID{Valid Request?}

  VALID -->|No| RESP_BADREQ[Return 400 Bad Request]
  VALID -->|Yes| EDGE_LOOKUP[Check Edge Cache]

  EDGE_LOOKUP -->|HIT| RESP_EDGE[Serve from Edge Cache]
  EDGE_LOOKUP -->|MISS| R2_ALLOWED{R2 Allowed?}

  R2_ALLOWED -->|Yes| R2_CHECK[Check R2 Persistent Cache]
  R2_ALLOWED -->|No| FETCH_ORIGIN[Fetch from Origin API]

  R2_CHECK -->|Fresh HIT| RESP_R2[Serve from R2<br/>and repopulate Edge Cache]
  R2_CHECK -->|MISS or STALE| FETCH_ORIGIN

  FETCH_ORIGIN --> ANALYSE[Analyse Response]
  ANALYSE --> CACHEABLE{Cacheable?}

  CACHEABLE -->|No| RESP_PASS[Return Pass-through Response]
  CACHEABLE -->|Yes| TTL[Compute TTL]

  TTL --> PUT_EDGE[Write to Edge Cache]
  PUT_EDGE --> R2_WRITE{Eligible for R2 Write?}

  R2_WRITE -->|Yes| PUT_R2[Write to R2]
  R2_WRITE -->|No| RESP_FINAL[Return Response to User]

  PUT_R2 --> RESP_FINAL

  RESP_EDGE --> RESP_FINAL
  RESP_R2 --> RESP_FINAL

  RESP_BYPASS --> RESP_DONE[Response Complete]
  RESP_BADREQ --> RESP_DONE
  RESP_PASS --> RESP_DONE
  RESP_FINAL --> RESP_DONE
```

# 🕒 Request Lifecycle — Cache Warm-up Behaviour

This timeline illustrates how the system behaves over time. The first request typically results in a cache miss and triggers origin processing, after which the response is cached. Subsequent identical requests are served directly from the edge cache, significantly reducing latency and backend load.

This helps demonstrate the performance benefits of caching as traffic patterns stabilise.

```mermaid
timeline
    title GET Request Lifecycle — Cache Warm-up and Reuse

    t0 : Client sends initial GET request
    t1 : Worker evaluates bypass and request validity
    t2 : KV config and TTL policies loaded
    t3 : Request normalised and cache key generated

    t4 : Edge cache MISS
    t5 : R2 check (if enabled)

    t6 : Fetch from origin API
    t7 : Response analysed (size, structure, cacheability)
    t8 : TTL computed (operator or size-based)

    t9 : Response stored in edge cache
    t10 : Response optionally stored in R2

    t11 : Response returned to client (MISS path)

    t12 : Subsequent identical request arrives
    t13 : Edge cache HIT
    t14 : Response returned immediately (low latency)
```

# 🧑‍💻 Operational Journey — Adopting the Edge Cache Proxy

This diagram illustrates how the solution is adopted and operated in practice. It shows how traffic is routed through the edge, how caching behaviour is validated, and how operators can observe and control runtime behaviour.

The goal is to ensure that the system is not only performant, but also transparent and easy to operate in a production environment.

```mermaid
journey
    title Operational Journey — Smart Edge Cache Proxy

    section Integration
      Route API traffic through Edge Worker : 5
      Configure DNS / routing in Cloudflare : 4
      Validate requests are received at edge : 4

    section Cache Validation
      Initial request results in cache MISS : 4
      Subsequent identical request returns cache HIT : 5
      Observe reduced latency and origin calls : 5

    section Observability
      Inspect cache behaviour via response headers : 5
      Validate cache key normalisation : 4
      Trace request path through system : 4

    section Runtime Control
      Enable bypass for debugging or testing : 5
      Validate direct origin response path : 4
      Adjust behaviour via environment configuration : 4
```

# 🧠 Smart Edge Cache Proxy — Capability Overview

This mindmap provides a high-level view of the system capabilities. It summarises how the solution handles request orchestration, caching strategy, configuration, and operational control.

The purpose of this view is to quickly communicate the core responsibilities of the system without focusing on implementation details.

```mermaid
mindmap
  root((Smart Edge Cache Proxy))

    Edge Orchestration
      Acts as control layer between client and origin
      Enforces request validation and policies
      Routes traffic through cache hierarchy
      Supports optional strict configuration mode

    Caching Strategy
      Multi-tier caching (Edge + R2)
      Adaptive TTL based on response characteristics
      Cache key derived from normalised request
      Stale-on-error for resilience

    Request Normalisation
      KV-driven allow rules
      Canonical query handling
      Removal of non-essential parameters
      Ensures deterministic cache keys

    Configuration Layer
      Endpoint-specific rules
      Global TTL policies
      Optional operator-based TTL control
      Runtime-configurable behaviour

    Runtime Control
      Bypass mechanisms for debugging
      Environment-based overrides
      Safe testing of origin behaviour

    Observability
      Cache status visibility
      Request trace information
      TTL decision transparency
      Response size awareness
```

# 🧭 Summary

The diagrams in this section provide a visual representation of how the Smart Edge Cache Proxy operates and how its different components interact across the request lifecycle.

Together, they illustrate several important aspects of the system, including the overall architectural structure, the path taken by requests as they move through the edge worker, and the decision logic used to determine whether responses should be served from cache, persistent storage, or the origin API.

They also highlight how caching behaviour is influenced by configuration stored in KV, how URL normalisation ensures deterministic cache keys, and how optional R2 storage provides a persistent tier for large responses. In addition, the diagrams demonstrate how diagnostic headers, logging, and runtime controls allow engineers to observe system behaviour and troubleshoot issues in production environments.

Taken together, these diagrams provide a concise visual overview of the Smart Edge Cache Proxy, complementing the detailed architectural explanations presented throughout the rest of this documentation.