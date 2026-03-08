import type { APIRoute } from 'astro';
import {
	contentSlug,
	getPublishedWorkEntries,
	getPublishedWorkTags,
	slugifyTag,
} from '../lib/data/portfolio-data';

export const prerender = true;

const toUrl = (origin: string, path: string) => `${origin}${path}`;

const xmlEscape = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ request }) => {
	const origin = new URL(request.url).origin;
	const staticPaths = ['/', '/about/', '/contact/', '/work/'];
	const [workEntries, workTags] = await Promise.all([getPublishedWorkEntries(), getPublishedWorkTags()]);

	const contentPaths = [
		...workEntries.map((entry) => `/work/${contentSlug(entry.id)}/`),
		...workTags.map((tag) => `/work/tags/${slugifyTag(tag)}/`),
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
