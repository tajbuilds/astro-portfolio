import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const work = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).min(1),
		featured: z.boolean().default(false),
		draft: z.boolean().optional(),
		github: z.string().url().optional(),
	}),
});

export const collections = { blog, work };

