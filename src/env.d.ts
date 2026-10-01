type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_SUBJECT_PREFIX: string;
  TURNSTILE_SITE_SECRET: string;
  RESEND_API_KEY: string;
  PUBLIC_GA_MEASUREMENT_ID?: string;
  GITBOOK_TOKEN?: string;
  GITBOOK_SPACE_ID?: string;
}

// Cloudflare secrets are set via `wrangler secret` / `.dev.vars` and are
// intentionally absent from wrangler.json, so they are declared here to
// augment the generated Cloudflare.Env type.
declare namespace Cloudflare {
  interface Env {
    RESEND_API_KEY: string;
    TURNSTILE_SITE_SECRET: string;
    GITBOOK_TOKEN?: string;
  }
}
