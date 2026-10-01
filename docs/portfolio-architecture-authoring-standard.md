# Portfolio Architecture Authoring Standard

Status: Working standard  
Applies to: Public portfolio projects and architecture case studies  
Purpose: Keep every project focused on Solution Architecture rather than implementation detail.

## 1. Portfolio Objective

The portfolio exists to demonstrate how an architect approaches a problem from context through to an appropriate solution.

A case study should show the ability to:

- understand a business or operational problem;
- identify stakeholders, concerns, constraints and desired outcomes;
- establish scope and architectural boundaries;
- understand the current situation at an appropriate level;
- define a target architecture;
- compare options and make defensible decisions;
- communicate architecture through clear viewpoints;
- consider security, resilience, operability, cost and governance;
- plan transition from current to target state;
- validate whether the solution meets the original need;
- communicate technical decisions to both technical and non-technical audiences.

The portfolio is not intended to prove coding depth by exposing implementation internals.

Technical details are included only when they help explain an architectural choice.

## 2. Architectural Lens

The writing should naturally reflect established architecture practice without repeatedly naming frameworks.

Useful concepts include:

- business drivers and outcomes;
- stakeholders and stakeholder concerns;
- principles;
- requirements and constraints;
- scope and boundaries;
- current-state and target-state views;
- business, application, data/information and technology perspectives;
- interfaces and integrations;
- security and trust boundaries;
- resilience and failure behaviour;
- observability and operations;
- architecture decisions and trade-offs;
- transition states and migration considerations;
- risks, assumptions and dependencies;
- governance and validation.

These ideas may be influenced by disciplines such as enterprise architecture, solution architecture, TOGAF, ArchiMate, C4 and architecture decision records, but public case studies should use the concepts naturally rather than presenting themselves as framework exercises.

The reader should be able to recognise structured architectural thinking without being told that a specific framework was followed.

## 3. Intended Audience

Write primarily for:

- hiring managers;
- Heads of Engineering;
- senior architects;
- engineering managers;
- product and delivery leaders;
- technically aware business stakeholders.

Assume the reader understands systems and business technology but does not want to read source-code-level implementation detail.

A strong project should therefore be understandable at two levels:

1. a non-specialist reader should understand the problem, decision and value;
2. an architect or senior engineer should see enough structure and technical credibility to understand why the design is sound.

## 4. Public-Safe Boundary

Portfolio content is a curated architectural representation, not a copy of internal project documentation.

Never publish:

- employer or customer confidential information;
- internal domains or private URLs;
- IP addresses;
- credentials, keys, tokens or secrets;
- employee or customer personal information;
- proprietary datasets or schemas;
- exact internal infrastructure identifiers;
- commercially sensitive costs or contract information;
- confidential traffic, capacity or usage figures;
- internal security controls that would create unnecessary exposure;
- operational procedures that should remain private;
- implementation details that are not needed to demonstrate the architectural decision.

Where useful, replace internal specifics with neutral descriptions.

Example:

Instead of:

> Four named company websites generated 80,000 requests per day against a specific paid backend allocation.

Prefer:

> Multiple customer-facing applications depended on a shared backend, and repeated read requests were consuming capacity needed by other workloads.

The public version should preserve the architectural problem and reasoning while removing company-specific detail.

## 5. Recommended Case Study Structure

Each project should normally follow this narrative.

### 5.1 Executive Overview

Answer quickly:

- What was the problem?
- Why did it matter?
- What was my architectural responsibility?
- What changed?
- What value did the solution create?

This should be understandable without reading the rest of the case study.

### 5.2 Context and Business Problem

Explain the situation before proposing technology.

Cover:

- business or operational context;
- pain points;
- desired outcome;
- important stakeholders;
- why the existing situation was insufficient.

Avoid jumping directly to tools.

### 5.3 Scope and Boundaries

Clarify:

- what the architecture needed to solve;
- what was explicitly out of scope;
- system boundaries;
- important assumptions;
- key dependencies.

This prevents the case study from implying that one design solved an entire enterprise problem.

### 5.4 Drivers, Requirements and Constraints

Capture the forces shaping the architecture.

Typical examples:

- performance;
- scalability;
- integration constraints;
- delivery timescale;
- security;
- operability;
- cost;
- existing platforms;
- team capability;
- availability;
- maintainability;
- compliance.

Separate genuine requirements from implementation preferences.

### 5.5 Current-State View

Describe the baseline architecture only to the depth required to understand the problem.

Prefer:

- high-level system context;
- key dependencies;
- important data or request flows;
- constraints created by the current design.

Avoid documenting every component.

### 5.6 Architecture Options

Where meaningful, show that alternatives were considered.

For each serious option explain:

- what it would change;
- advantages;
- drawbacks;
- risks;
- why it was or was not selected.

Do not manufacture alternatives simply to make the document look formal.

### 5.7 Target Architecture

Present the selected design using the viewpoints necessary to answer stakeholder concerns.

Possible views include:

- system context;
- container/application view;
- integration view;
- information/data flow;
- deployment/technology view;
- security/trust boundaries;
- operational/observability view.

Not every project needs every view.

Use the minimum set that communicates the architecture clearly.

### 5.8 Key Architecture Decisions

Explain the important decisions rather than every implementation choice.

A useful decision statement answers:

- What decision was required?
- What options existed?
- What factors mattered?
- What was selected?
- What trade-off was accepted?
- What consequence did the decision create?

### 5.9 Quality Attributes and Cross-Cutting Concerns

Discuss the qualities that materially shaped the design.

Depending on the project this can include:

- security;
- performance;
- resilience;
- scalability;
- availability;
- maintainability;
- observability;
- interoperability;
- cost efficiency;
- data integrity;
- supportability.

Tie each concern to architectural choices rather than listing generic best practices.

### 5.10 Transition and Delivery

Where relevant, describe how the architecture could be introduced safely.

Cover:

- phased adoption;
- coexistence with existing systems;
- migration sequencing;
- dependencies;
- rollback or fallback;
- operational readiness.

This demonstrates that architecture is concerned with getting from current state to target state, not only drawing the target diagram.

### 5.11 Validation and Evidence

Explain how confidence in the architecture was established.

Examples:

- proof of concept;
- performance evidence;
- integration testing;
- functional parity;
- failure testing;
- stakeholder review;
- operational testing;
- architecture review;
- measurable before/after outcomes.

Avoid publishing sensitive internal measurements. Generalised evidence is sufficient when necessary.

### 5.12 Outcome and Reflection

Close the loop back to the original problem.

Explain:

- what improved;
- what value was created;
- what trade-offs remained;
- what would be evolved next;
- what architectural lesson was learned.

## 6. Diagram Standard

Diagrams are used to communicate a viewpoint, not decorate a page.

Every diagram should answer a specific architectural question.

Examples:

### System Context

Shows:

- users or external actors;
- the system being discussed;
- major external systems;
- key relationships.

### Application / Container View

Shows:

- major deployable or logical application components;
- responsibilities;
- important interactions.

### Integration View

Shows:

- producers and consumers;
- APIs, events or messaging;
- major transformation/orchestration boundaries;
- synchronous versus asynchronous relationships.

### Information Flow

Shows:

- important information movement;
- ownership;
- transformation;
- storage boundaries.

### Deployment / Technology View

Shows only infrastructure relevant to architectural decisions.

### Security / Trust View

Shows:

- trust boundaries;
- identity provider;
- authentication/authorisation boundary;
- sensitive integration points.

Do not create a diagram merely because architecture documents are expected to contain one.

Prefer clear Mermaid diagrams where they communicate the view adequately.

## 7. Level of Technical Detail

Use this test:

> Does this detail help a reader understand an architectural responsibility, decision, constraint, trade-off or outcome?

If yes, it may belong.

If it only explains how code was implemented, it probably does not.

### Usually appropriate

- REST versus asynchronous messaging;
- edge versus origin processing;
- cache strategy;
- integration boundaries;
- service ownership;
- event flow;
- deployment model;
- identity and trust boundaries;
- resilience behaviour;
- observability model;
- architectural patterns;
- technology selection rationale.

### Usually too detailed for the main case study

- source-code walkthroughs;
- function names;
- individual SQL statements;
- framework boilerplate;
- low-level API payloads;
- CSS/UI fixes;
- command-line troubleshooting;
- exact server configuration;
- exhaustive schema definitions.

Deep technical evidence may be referenced or placed in a deliberately optional appendix if it materially strengthens the case study.

## 8. Technology Naming

Technology names may be used when they strengthen the architectural story.

The portfolio should not become vendor marketing.

Prefer:

> An edge execution layer was introduced to intercept suitable read traffic and serve cacheable responses closer to consumers. Cloudflare Workers and the Cache API were selected because they fitted the existing edge platform and operational model.

Rather than:

> The project used Cloudflare Workers, TypeScript, Cache API, R2, KV, Durable Objects...

List only technologies that were architecturally significant.

## 9. Framework Discipline

Frameworks are tools for thinking, not labels to decorate a portfolio.

Do not write:

> Using TOGAF, I performed Phase B...

unless a project genuinely required formal TOGAF deliverables.

Prefer writing that demonstrates the underlying discipline:

> I first clarified the business drivers, stakeholders and scope, then documented the current constraints before comparing target-state options.

Likewise, do not describe every diagram as an ArchiMate or C4 artefact unless that notation is genuinely useful to the reader.

Use consistent viewpoints and relationships so that the thinking is recognisable to experienced architects.

## 10. Voice

Prefer:

- clear;
- concise;
- architecture-led;
- outcome-focused;
- evidence-based;
- vendor-neutral where practical;
- confident without overstating ownership.

Avoid:

- excessive first-person repetition;
- implementation diary language;
- unexplained jargon;
- inflated claims;
- pretending one person made every project decision;
- framework name-dropping;
- unnecessary low-level detail.

Use first person when explaining personal responsibility or reasoning:

> I was responsible for defining the integration approach and evaluating how the existing platform could support the target flow.

Use neutral architecture language for the system itself:

> The target design introduced an asynchronous messaging boundary between the external event source and the internal consumer.

## 11. Showing Personal Contribution

A portfolio must distinguish architectural contribution from the wider team effort.

Where appropriate, identify responsibilities such as:

- discovery;
- requirements clarification;
- architecture option assessment;
- solution design;
- integration design;
- architecture diagrams;
- proof-of-concept direction;
- stakeholder communication;
- technical validation;
- implementation guidance;
- transition planning;
- operational design.

Do not imply sole ownership of work performed collaboratively.

## 12. Definition of Done for a Public Project

Before a project is marked public, verify:

- the business problem is understandable;
- architectural scope is clear;
- stakeholders/concerns are represented where relevant;
- requirements and constraints are visible;
- current and target state are distinguishable;
- important decisions and trade-offs are explained;
- diagrams have a clear purpose;
- technical detail remains architecture-level;
- personal architectural contribution is identifiable;
- outcomes connect back to the original problem;
- confidential/company-specific details have been removed;
- the writing works for a non-specialist senior stakeholder;
- an architect can still see credible technical reasoning;
- no page reads like an implementation diary;
- no framework terminology is being used merely for effect.

## 13. Guiding Principle

Every case study should answer:

> What problem needed solving, what architectural forces shaped the solution, what decisions were made, how was the target architecture communicated and validated, and what outcome did it enable?

If a section does not help answer that question, reconsider whether it belongs in the public portfolio.
