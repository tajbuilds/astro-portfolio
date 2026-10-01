---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "60aef5ae-f0a0-446b-b05b-1c706ad666f3"
source_metadata: {"id": "60aef5ae-f0a0-446b-b05b-1c706ad666f3", "case_study_id": "4768f30e-4add-4df4-ae5f-4f224087b84c", "parent_id": "4768f30e-4add-4df4-ae5f-4f224087b84c", "title": "📡 Communication Models — Pub/Sub & MOM", "slug": "communication-models-pub-sub-mom", "slug_path": "hybrid-distributed-emergency-notification-system/communication-models-pub-sub-mom", "depth": 1, "nav_order": 3, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-05-03T14:57:49.593Z", "checksum": "9dfdaa94c586a1f26b8b7062566b08781271814706dc21aabc424bf3df61084b", "excerpt": "This section explains how components in the system communicate using **asynchronous messaging patterns**, specifically:", "created_at": "2026-05-03T15:08:43.755Z", "updated_at": "2026-05-03 15:08:43", "synced_at": "2026-05-03 15:08:43"}
---
## 🎯 Purpose

This section explains how components in the system communicate using **asynchronous messaging patterns**, specifically:

* Publish–Subscribe (Pub/Sub)
* Message-Oriented Middleware (MOM)

These models enable the system to remain:

* decoupled
* scalable
* resilient

---

## 🧠 Why Messaging is Required

In a distributed system, direct communication between components leads to:

* tight coupling
* reduced scalability
* fragile dependencies

Instead, this system uses messaging to:

> **separate producers and consumers, allowing each component to operate independently**

---

## 📡 Publish–Subscribe Model

### 🔍 Concept

In the Pub/Sub model:

* a producer publishes an event
* multiple consumers subscribe to that event
* all subscribers receive the message independently

---

### 🧩 Implementation in the System

* Event detection layer publishes alerts
* Notification services subscribe to those events
* Multiple delivery channels receive the same event

---

### 📊 Diagram — Pub/Sub Flow

```mermaidjs
flowchart LR

    A["Event Producer (ML Detection)"] --> B["SNS Topic"]

    B --> C["SMS Notification"]
    B --> D["Mobile App"]
    B --> E["Email Service"]
    B --> F["External Systems"]
```

---

### ✅ Benefits

* supports multiple consumers
* enables broadcast-style communication
* simplifies addition of new subscribers

---

### ⚠️ Trade-Off

* no guarantee all consumers process at the same speed
* requires monitoring and retry mechanisms

---

## 📬 Message-Oriented Middleware (MOM)

### 🔍 Concept

MOM is used for **reliable, asynchronous message delivery** between components.

Messages are:

* queued
* processed independently
* retried if necessary

---

### 🧩 Implementation in the System

* processing stages communicate via message queues
* tasks are decoupled and executed asynchronously
* failures can be retried without affecting upstream systems

---

### 📊 Diagram — MOM Flow

```mermaid
flowchart LR

    A["Data Processing Stage"] --> B["Message Queue"]

    B --> C["ML Processing"]
    B --> D["Storage Service"]
    B --> E["Analytics Pipeline"]
```

---

### ✅ Benefits

* reliable message delivery
* decouples processing stages
* supports retry and fault tolerance

---

### ⚠️ Trade-Off

* introduces latency compared to direct calls
* requires queue management and monitoring

---

## 🔄 Combined Communication Model

In this system, both models are used together:

```mermaidjs
flowchart TD

    A["Incoming Data Event"] --> B["Processing Queue (MOM)"]

    B --> C["ML Detection"]

    C --> D["Event Topic (Pub/Sub)"]

    D --> E["Notification Services"]
```

---

## 🧠 When Each Model is Used

| Scenario | Model Used | Reason |
|----------|------------|--------|
| Processing pipeline | MOM        | Reliable task execution |
| Event notification | Pub/Sub    | Broadcast to multiple consumers |
| Background processing | MOM        | Decoupled execution |
| User alerts | Pub/Sub    | Multi-channel delivery |

---

## ⚙️ Architectural Impact

Using these models enables:

### 🔁 Decoupling

Producers and consumers do not depend on each other

---

### 📈 Scalability

Components can scale independently

---

### 🛡️ Reliability

Messages are not lost during failures

---

### ⚡ Flexibility

New consumers can be added without changing producers

---

## 💡 Why This Matters

Without messaging:

* system becomes tightly coupled
* scaling becomes difficult
* failures propagate across components

With messaging:

> **the system behaves as a loosely connected set of independent services**

---

## 🧠 Summary

This system uses a combination of:

* **Message-Oriented Middleware** for reliable processing
* **Publish–Subscribe** for event distribution

Together, these patterns enable:

* scalable communication
* resilient processing
* flexible system evolution