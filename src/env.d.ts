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
  MEDIA_BUCKET: R2Bucket;
  MEDIA_UPLOAD_TOKEN?: string;
}
