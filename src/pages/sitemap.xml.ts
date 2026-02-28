import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const toUrl = (origin: string, path: string) => `${origin}${path}`;
const slugifyTag = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const xmlEscape = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ request }) => {
	const origin = new URL(request.url).origin;

	const staticPaths = ['/', '/about/', '/blog/', '/contact/', '/work/'];

	const [blogEntries, workEntries] = await Promise.all([
		getCollection('blog', ({ data }) => !data.draft),
		getCollection('work', ({ data }) => !data.draft),
	]);

	const workTagPaths = Array.from(
		new Set(
			workEntries
				.flatMap((entry) => entry.data.tags ?? [])
				.map((tag) => `/work/tags/${slugifyTag(tag)}/`),
		),
	).sort();

	const contentPaths = [
		...blogEntries.map((entry) => `/blog/${entry.slug}/`),
		...workEntries.map((entry) => `/work/${entry.slug}/`),
		...workTagPaths,
	];

	const allPaths = Array.from(new Set([...staticPaths, ...contentPaths])).sort();

	const urls = allPaths
		.map((path) => `  <url><loc>${xmlEscape(toUrl(origin, path))}</loc></url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600',
		},
	});
};
