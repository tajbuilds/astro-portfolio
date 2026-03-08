// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

const enablePlatformProxy = process.env.CF_PLATFORM_PROXY === "true";
const site = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || "https://tajs.io";

// https://astro.build/config
export default defineConfig({
	site,
	integrations: [sitemap()],
	adapter: cloudflare({
		imageService: "compile",
		platformProxy: {
			enabled: enablePlatformProxy,
		},
	}),
});
