---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "243a2c3e-5eeb-4e9b-9e26-585c667d45f2"
source_metadata: {"id": "243a2c3e-5eeb-4e9b-9e26-585c667d45f2", "case_study_id": "39868724-0606-4ae2-9bdf-8b623c8d5a04", "parent_id": "39868724-0606-4ae2-9bdf-8b623c8d5a04", "title": "🧭 Architecture & Data Flow Diagrams", "slug": "architecture-data-flow-diagrams", "slug_path": "ai-knowledge-ingestion-copilot-enablement-platform/architecture-data-flow-diagrams", "depth": 1, "nav_order": 4, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-05-03T14:29:19.179Z", "checksum": "486aa8d3acf32dce07669c809e915152040cee2b2d733d3b58fdc91133a9c9d4", "excerpt": "A[\"Admin User\"] --> B[\"Admin Application\"]", "created_at": "2026-03-21T10:43:53.685Z", "updated_at": "2026-05-03 15:08:47", "synced_at": "2026-05-03 15:08:47"}
---
# 🧭 High-Level Solution Architecture

```mermaid
flowchart LR

    A["Admin User"] --> B["Admin Application"]

    B --> C["Hash Validation"]
    C --> D[("Metadata Store (D1)")]

    D -->|Duplicate| E["Reject"]
    D -->|New| F["Accept"]

    B --> G["Microsoft Graph API"]
    G --> H["Raw Transcript Storage"]

    F --> H

    H --> I["Processing Pipeline"]

    I --> J["Cleaned Transcripts"]
    I --> K["Decisions & Actions"]
    I --> L["Project Context"]

    J --> M["AI Agent (Copilot)"]
    K --> M
    L --> M

    M --> N["User Response"]
```

## 🧾 Summary

This diagram shows the full system lifecycle, from controlled ingestion through transformation and structured storage, to final AI consumption.

It highlights the separation between ingestion, processing, knowledge structuring, and AI interaction.

---

# ⚙️ Ingestion & Transformation Workflow

```mermaid
flowchart TD

    A["Transcript Upload"] --> B["Generate Hash"]
    B --> C["Check D1 Store"]

    C -->|Duplicate| D["Reject Upload"]
    C -->|New| E["Store Raw Transcript"]

    E --> F["Cleaning Stage"]
    F --> G["Store Cleaned Transcript"]

    G --> H["Extraction Stage"]
    H --> I["Store Decisions & Actions"]

    I --> J["Context Generation"]
    J --> K["Store Project Context"]

    K --> L["Indexed for AI Retrieval"]
```

## 🧾 Summary

This workflow illustrates the step-by-step lifecycle of a transcript after upload, including validation, AI enrichment, structured storage, and knowledge indexing.

---

# 🔄 Data Flow Diagram

```mermaid
flowchart LR

    A["Transcript File"] --> B["Admin App"]

    B --> C["Hash Value"]
    C --> D[("Cloudflare D1")]

    D -->|exists| E["Duplicate Response"]
    D -->|not exists| F["Proceed"]

    B --> G["Microsoft Graph API"]
    G --> H["SharePoint Incoming"]

    H --> I["AI Cleaning Output"]
    I --> J["Cleaned Transcript File"]

    J --> K["AI Extraction Output"]
    K --> L["Decisions / Actions File"]

    L --> M["AI Context Output"]
    M --> N["Project Context File"]

    N --> O["SharePoint Knowledge Base"]

    O --> P["Copilot Studio Agent"]
    P --> Q["User Response"]
```

## 🧾 Summary

Highlights how data transforms across the system, from raw transcript to structured knowledge assets consumed by Copilot.

---

# 🗂️ SharePoint Information Architecture

```mermaid
flowchart TD

    A["AI-Knowledge Root"]

    A --> B["Incoming / Raw Uploads"]
    A --> C["Cleaned Transcripts"]
    A --> D["Decisions & Actions"]
    A --> E["Project Context"]
    A --> F["Failed / Rejected"]
    A --> G["Archived / Processed"]
```

## 🧾 Summary

Defines the structured SharePoint layout used to organise and curate knowledge for Copilot grounding.

---

# 🤖 AI Enrichment Stages

```mermaid
flowchart LR

    A["Raw Transcript"] --> B["AI Stage 1: Cleaning"]
    B --> C["Cleaned Transcript"]

    C --> D["AI Stage 2: Extraction"]
    D --> E["Decisions / Actions / Risks"]

    E --> F["AI Stage 3: Context Synthesis"]
    F --> G["Project Context Summary"]
```

## 🧾 Summary

Shows how AI is applied in controlled stages to progressively enrich and structure transcript data.

---

# 🔐 Security and Governance

```mermaid
flowchart LR

    A["Admin App"] --> B["Auth / Identity"]
    B --> C["Microsoft Graph API"]

    C --> D["SharePoint Site (Scoped Access)"]

    A --> E["Hash Check"]
    E --> F[("Cloudflare D1")]

    D --> G["AI Processing Layer"]

    G --> H["Curated Folders Only"]

    H --> I["Copilot Studio Agent"]

    J["Audit / Logging"] --> G
    J --> I
```

## 🧾 Summary

Illustrates access control, validation, and governance ensuring only approved and processed content is exposed to Copilot.

---

# 🧠 Copilot Knowledge Consumption

```mermaid
flowchart TD

    A["User Query"] --> B["Copilot Studio Agent"]

    B --> C["Project Context Folder"]
    B --> D["Decisions & Actions Folder"]
    B --> E["Cleaned Transcripts Folder"]

    C --> F["Prioritised Response"]
    D --> F
    E --> F

    F --> G["Grounded Answer to User"]
```

## 🧾 Summary

Shows how the Copilot agent prioritises structured knowledge sources to generate accurate and context-aware responses.

---

# 🧱 System Components View

```mermaid
flowchart LR

    A["Frontend: Vite Admin App"]
    B["Edge: Cloudflare Workers"]
    C["DB: Cloudflare D1"]
    D["Storage: SharePoint"]
    E["AI Services"]
    F["Consumption: Copilot Studio"]

    A --> B
    B --> C
    B --> D
    B --> E
    D --> F
```

## 🧾 Summary

Provides a simplified component-level overview of system layers and responsibilities across the platform.