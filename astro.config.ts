import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
const site = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || "https://tajs.io";

export default defineConfig({
		site,
		integrations: [
		starlight({
			title: "Case Studies",
			description: "Long-form architecture case studies.",
			customCss: ["./src/styles/starlight-lab.css"],
			head: [{ tag: "script", attrs: { type: "module", src: "/scripts/starlight-mermaid.js" } }],
			sidebar: [
				{
					label: "Case Studies",
					autogenerate: { directory: "case-studies" },
				},
			],
		}),
		sitemap(),
	],
});
