type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_SUBJECT_PREFIX: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SITE_SECRET: string;
  RESEND_API_KEY: string;
  PUBLIC_GA_MEASUREMENT_ID?: string;
  GITBOOK_TOKEN?: string;
  GITBOOK_SPACE_ID?: string;
  GITBOOK_PROJECTS_PATH?: string;
}
