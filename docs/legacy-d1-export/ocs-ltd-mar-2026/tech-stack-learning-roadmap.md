---
source: "d1"
source_database: "portfolio_content_prod"
source_table: "documents"
source_id: "cebdb7cd-ff63-4705-8570-d24d2481c5bf"
source_metadata: {"id": "cebdb7cd-ff63-4705-8570-d24d2481c5bf", "case_study_id": "17e6d2c2-b96c-4279-bc74-bab7c065e193", "parent_id": "17e6d2c2-b96c-4279-bc74-bab7c065e193", "title": "🛠️Tech Stack & Learning Roadmap", "slug": "tech-stack-learning-roadmap", "slug_path": "ocs-ltd-mar-2026/tech-stack-learning-roadmap", "depth": 1, "nav_order": 1, "is_root": 0, "is_published": 1, "outline_updated_at": "2026-03-22T12:00:47.086Z", "checksum": "7348c6d7d96103b24f06212eafa2dcd787d919444fbd33511addf75cb43972eb", "excerpt": "OCS is moving toward a **\"fully automated digital business model\"** that connects siloed data into a unified architecture.", "created_at": "2026-03-22T15:32:32.871Z", "updated_at": "2026-03-22 15:48:45", "synced_at": "2026-03-22 15:48:45"}
---
### 🌐 The OCS Technical Ecosystem

OCS is moving toward a **"fully automated digital business model"** that connects siloed data into a unified architecture.

#### 1. Integration & Middleware (The "ESB" Layer)

* **Azure Logic Apps:** Used for visual, low-code workflow automation to connect different SaaS applications.
* **Azure Functions:** Used for event-driven, serverless code execution (similar to your Cloudflare Workers experience).
* **Azure Integration Services:** The broader suite used to manage APIs and data flow between internal and vendor systems.

#### 2. Business Process Management (BPM) & Automation

* **Bizagi:** A digital process automation platform. It uses BPMN (Business Process Model and Notation) to map and automate complex business workflows.
* **Role Context:** You will likely architect how Bizagi interacts with backend databases and front-end user interfaces.

#### 3. Enterprise Applications (The Data Sources)

* **IBM Maximo / Concept Evolution:** These are CAFM (Computer-Aided Facilities Management) tools used to track every physical asset OCS maintains.
* **Salesforce / MS Dynamics CRM:** The systems of record for client contracts, sales leads, and commercial bid data.
* **Data Ingestion:** Large-scale data onboarding and mapping are critical for these applications.

---

### 📚 Learning Roadmap (Bridging the Gap)

*Since you have a strong background in **Python, Java, and Cloudflare**, focus on how these translate to the Microsoft/Enterprise world.*

#### Phase 1: Integration Architecture Patterns (High Priority)

* **Topic:** Event-Driven Architecture (EDA).
* **OCS Relevance:** They use event-driven workflows to improve operational efficiency.
* **Action:** Research **"Publisher-Subscriber"** and **"Request-Response"** patterns in the context of Azure Service Bus.
* **Bridge:** Relate this to how you handled integrations between internal and third-party travel systems at Fred. Olsen.

  \

#### Phase 2: Mastering the Azure Integration Suite

* **Topic:** Azure Logic Apps vs. Azure Functions.
* **Action:** Watch a 20-minute "Azure Logic Apps for Developers" tutorial.
* **Key Question:** When would you use a Logic App (low-code) versus a Function (custom code)?
* **Bridge:** Your experience with **Cloudflare Workers** is your "hook" here—mention you understand serverless compute and edge-based request handling.

  \

#### Phase 3: Business Process Modeling (BPMN)

* **Topic:** BPMN 2.0 Basics.
* **OCS Relevance:** Bizagi is listed as a key automation tool.
* **Action:** Learn the 5 basic BPMN symbols: Task, Gateway (Decision), Start Event, End Event, and Sequence Flow.
* **Bridge:** You already build automation workflows to reduce manual effort; BPMN is just the formal language for documenting them.

  \

#### Phase 4: Data Mapping & Security

* **Topic:** API Mediation & Security Layers.
* **OCS Relevance:** They need secure, resilient solutions for sensitive sectors like Healthcare and Government.
* **Action:** Review **OAuth 2.0** and **OpenID Connect** for securing enterprise APIs.
* **Bridge:** Lean heavily on your **First Class Cyber Security degree** and experience with secure request handling.

  \

---

### 📝 Strategic Discussion Points for the Interview

* **The "Pattern" over the "Platform":** *"While my recent work is in Cloudflare and Python, I am highly proficient in the architectural patterns OCS uses, such as event-driven integration and API mediation"*.
* **Longevity & Quality:** *"I focus on building architectures that aren't just 'quick fixes' but are scalable and maintainable for the long-term governance of the TDA"*.
* **Data Onboarding:** *"I understand the complexity of mapping diverse data sets into core applications like Maximo or Dynamics during the commercial bid process"*.