# Portfolio Specification

Product and design baseline for this portfolio.

## Objective

Create a modern, smooth, and fast personal portfolio that highlights selected work, professional identity, and contact pathways.

## Audience

- Recruiters and hiring managers
- Potential freelance/contract clients
- Technical peers and collaborators

## Primary Outcomes

- Communicate who you are in under 10 seconds.
- Showcase 3-6 high-quality projects with clear impact.
- Make contact effortless from every key page.

## Information Architecture

Core routes:

- `/` Home
- `/projects` Project index
- `/projects/[slug]` Project case study
- `/about`
- `/contact`

Optional routes (phase 2):

- `/resume`

## Home Page Sections

1. Hero: name, role, concise value proposition, primary CTA.
2. Featured work: 2-4 projects with outcome-focused summaries.
3. Skills/stack snapshot: concise and credible, no long icon walls.
4. About preview: short narrative and link to full page.
5. Contact CTA: direct path to email/form/social.

## Project Card Requirements

Each project preview should include:

- Project name
- Short impact statement
- Tech stack (few key items)
- Role and timeline
- Link to case study and/or live demo

## Case Study Requirements

Each project detail page should include:

- Context/problem
- Constraints
- Solution approach
- Outcome/metrics (or qualitative results)
- Screenshots/visuals
- Key learnings

## Visual Direction

- Tone: modern, professional, and confident.
- Layout: clean with intentional whitespace and hierarchy.
- Typography: expressive but readable; avoid default system feel.
- Color system: neutral base + one accent strategy.
- Motion: subtle transitions with purposeful meaning.

## Interaction and Motion Rules

- Page/section transitions should feel smooth, not flashy.
- Standard transition durations should generally stay within 300-500ms.
- Hover/focus states should be consistent and accessible.
- Respect `prefers-reduced-motion` across all animations.

## Technology Direction

- Astro + TypeScript as base.
- Minimal client-side hydration.
- Tailwind can be added for velocity, but utility sprawl should be controlled.
- Avoid unnecessary framework additions unless a clear need exists.

## Content Guidelines

- Use direct, concrete language.
- Prioritize outcomes over task lists.
- Avoid buzzword-heavy copy.
- Keep project descriptions concise and scannable.

## Definition of Done (MVP)

- All core routes implemented.
- At least 3 complete project case studies.
- Responsive design for mobile and desktop.
- Accessibility baseline implemented (keyboard/focus/semantics/contrast).
- Build and check commands pass.
- Contact path is visible and functional.
