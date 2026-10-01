---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "edaeae76-fa95-4537-a598-aa1a4304cbd1"
source_metadata: {"id": "edaeae76-fa95-4537-a598-aa1a4304cbd1", "case_study_id": "4768f30e-4add-4df4-ae5f-4f224087b84c", "parent_id": "4768f30e-4add-4df4-ae5f-4f224087b84c", "title": "🧩 Architecture Diagrams", "slug": "architecture-diagrams", "slug_path": "hybrid-distributed-emergency-notification-system/architecture-diagrams", "depth": 1, "nav_order": 5, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-05-03T15:15:56.233Z", "checksum": "8706d2126643f77e0bf181370153648afb856595f788d397721036d05c7896ab", "excerpt": "This section provides visual representations of the system from different perspectives.", "created_at": "2026-05-03T15:08:43.807Z", "updated_at": "2026-05-03 15:23:07", "synced_at": "2026-05-03 15:23:07"}
---
## 🎯 Purpose

This section provides visual representations of the system from different perspectives.

Each diagram focuses on a specific aspect of the architecture, including:

* overall system structure
* event-driven behaviour
* communication patterns

The goal is to make both **design intent and system behaviour clear**.

---

# 🏗️ 1. End-to-End Architecture

```mermaid
flowchart LR

    A["IoT Sensors"] --> B["Edge Gateways"]

    B --> C["Streaming Layer (Kinesis)"]

    C --> D["Processing Layer (Glue / EMR)"]

    D --> E["Data Lake (S3)"]
    D --> F["Metadata Catalogue (Glue)"]

    F --> G["Analytics (Athena / QuickSight)"]

    E --> H["Machine Learning (SageMaker)"]

    H --> I["Event Processing (EventBridge / Lambda)"]

    I --> J["Notification Layer (SNS / Pinpoint)"]

    J --> K["End Users"]
```

### 💡 What this shows

* High-level system structure
* Separation of ingestion, processing, storage, and delivery
* End-to-end data journey

---

# 🔄 2. Event-Driven Processing Flow

```mermaid
sequenceDiagram

    participant Sensor
    participant Gateway
    participant Kinesis
    participant Processing
    participant ML
    participant EventBridge
    participant Notification

    Sensor->>Gateway: Generate data
    Gateway->>Kinesis: Stream data

    Kinesis->>Processing: Trigger processing
    Processing->>ML: Send processed data

    ML->>EventBridge: Publish event
    EventBridge->>Notification: Trigger alert

    Notification->>User: Deliver notification 
```

### 💡 What this shows

* Runtime behaviour
* Event-driven triggers
* Asynchronous flow

---

# 📡 3. Messaging Architecture (Pub/Sub + MOM)

```mermaid
flowchart TD

    A["Incoming Data"] --> B["Processing Queue (MOM)"]

    B --> C["ML Detection"]

    C --> D["Event Topic (Pub/Sub)"]

    D --> E["Notification Channels"]
```

### 💡 What this shows

* Separation of processing vs notification
* Use of messaging patterns
* Decoupled communication

---

# 🧠 Why multiple diagrams are used

A single diagram cannot effectively represent all aspects of a distributed system.

Instead:

| Diagram | Focus |
|---------|-------|
| Architecture | Structure |
| Event Flow | Behaviour |
| Messaging | Communication |

---

## 🧩 Design Approach

Each diagram was created to:

* isolate a specific concern
* avoid overloading a single view
* improve readability and clarity

---

## 💡 Architectural Insight

Breaking the system into multiple views reflects a key principle:

> **complex distributed systems should be understood through multiple perspectives, not a single representation**

---

## 🧠 Summary

These diagrams collectively show:

* how the system is structured
* how it behaves at runtime
* how components communicate

Together, they provide a complete view of the architecture.

---