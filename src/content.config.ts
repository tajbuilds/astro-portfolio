import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "zod";

const docs = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
	schema: docsSchema(),
});

const work = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).min(1),
		coverImage: z.string().optional(),
		featured: z.boolean().default(false),
		draft: z.boolean().optional(),
		github: z.string().url().optional(),
		externalCaseStudyUrl: z.string().min(1).optional(),
	}),
});

export const collections = { docs, work };
