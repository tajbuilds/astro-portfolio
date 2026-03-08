import { type CollectionEntry, getCollection } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;

export const contentSlug = (id: string) => id.replace(/\.(md|mdx)$/i, '');
export const slugifyTag = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const profileData = {
	name: 'Tajinder Singh',
	role: 'Solutions Architect',
	tagline: 'Architecture-first systems for edge, automation, and data',
	avatarUrl: '/images/tajinder-singh-portrait.jpg',
	location: 'United Kingdom',
} as const;

export const ctaData = {
	primary: { label: 'View Work', path: '/work' },
	secondary: { label: 'Contact', path: '/contact' },
} as const;

export const aboutData = {
	name: 'Tajinder Singh',
	headline: 'Solutions Architect',
	bio: 'Solutions architect focused on edge verification, automation-first flows, and operationally reliable data systems.',
	skills: ['Cloudflare Workers', 'n8n', 'TypeScript', 'Meilisearch', 'Xano'],
	focusAreas: ['Edge systems', 'Automation', 'Search and data platforms'],
	avatarUrl: '/images/tajinder-singh-portrait.jpg',
	social: [
		{ label: 'GitHub', url: 'https://github.com/tajbuilds' },
		{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/taj-tajinder/' },
	],
} as const;

export const contactData = {
	email: 'contact@tajs.io',
	formPath: '/api/contact',
	turnstileRequired: true,
	links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/taj-tajinder/' }],
} as const;

export const getPublishedWorkEntries = async () =>
	(await getCollection('work'))
		.filter((entry) => !entry.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const getFeaturedWorkEntries = async (limit = 4) =>
	(await getPublishedWorkEntries()).filter((entry) => entry.data.featured).slice(0, limit);

export const getPublishedWorkTags = async () =>
	Array.from(
		new Set((await getPublishedWorkEntries()).flatMap((item) => item.data.tags).map((tag) => tag.trim())),
	).sort((a, b) => a.localeCompare(b));

export const getWorkEntryBySlug = async (slug: string) =>
	(await getPublishedWorkEntries()).find((entry) => contentSlug(entry.id).toLowerCase() === slug.toLowerCase());
