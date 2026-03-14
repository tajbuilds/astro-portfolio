import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
const site = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || "https://tajs.io";

export default defineConfig({
	site,
	output: "server",
	adapter: cloudflare(),
	integrations: [
		sitemap(),
	],
});
