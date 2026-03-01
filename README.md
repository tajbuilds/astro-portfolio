# Taj | Solutions Architect Portfolio

Architecture-first portfolio built with Astro and deployed on Cloudflare.

This repo powers https://tajs.io and is focused on case studies across edge, automation, and data/search systems.

## Tech Stack

- Astro (TypeScript)
- Cloudflare Workers + static assets
- Astro content collections for Work and Blog
- Minimal client-side JavaScript (performance-first)

## Information Architecture

- Home: portfolio-first overview
- Work: case studies and tags
- Work detail: structured architecture write-ups
- About: background and focus areas
- Blog: currently marked as coming soon
- Contact: Turnstile-protected form + Resend delivery

## Local Development

```bash
npm install
npm run dev
```

Build locally:

```bash
npm run build
```

## Deployment

Cloudflare deployment uses Wrangler:

```bash
npm run deploy
```

Runtime secrets are configured in Cloudflare Dashboard (not committed):

- `RESEND_API_KEY`
- `TURNSTILE_SITE_SECRET`

Public/non-secret runtime vars are stored in `wrangler.json`.

## Content

- Work case studies: `src/content/work/*`
- Blog posts: `src/content/blog/*`
- Architecture diagrams: `public/diagrams/*`

## Security and Privacy

- No private keys or service secrets are committed.
- Case-study technical details are sanitized/generalized.
- See [SECURITY.md](./SECURITY.md) for reporting guidance.

## License

MIT. See [LICENSE](./LICENSE).
