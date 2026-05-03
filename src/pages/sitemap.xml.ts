import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
	contentSlug,
	getPublishedWorkEntries,
	getPublishedWorkTags,
	slugifyTag,
} from '../lib/data/portfolio-data';

export const prerender = false;

type CaseStudyRow = {
	id: string;
	slug: string;
};

type DocumentRow = {
	slug_path: string;
};

const normalizePath = (value: string | null | undefined) =>
	(value || '').trim().replace(/^\/+|\/+$/g, '');

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
	const staticPaths = ['/', '/about/', '/contact/', '/work/', '/docs/'];
	const [workEntries, workTags] = await Promise.all([getPublishedWorkEntries(), getPublishedWorkTags()]);

	const contentPaths = [
		...workEntries.map((entry) => `/work/${contentSlug(entry.id)}/`),
		...workTags.map((tag) => `/work/tags/${slugifyTag(tag)}/`),
	];

	const docsPaths: string[] = [];
	const db = env.DB as D1Database | undefined;

	if (db) {
		const caseStudiesResult = await db
			.prepare(
				`SELECT id, slug
				 FROM case_studies
				 WHERE is_visible = 1
				   AND source_collection_id = (
						SELECT oc.id
						FROM outline_collections oc
						WHERE oc.slug = 'case-studies'
						  AND oc.is_visible = 1
						ORDER BY oc.nav_order ASC, oc.updated_at DESC
						LIMIT 1
				   )
				 ORDER BY nav_order ASC, title ASC`
			)
			.all<CaseStudyRow>();

		for (const caseStudy of caseStudiesResult.results || []) {
			docsPaths.push(`/docs/case-studies/${caseStudy.slug}/`);

			const docsResult = await db
				.prepare(
					`SELECT slug_path
					 FROM documents
					 WHERE case_study_id = ?1
					 ORDER BY depth ASC, nav_order ASC, title ASC`
				)
				.bind(caseStudy.id)
				.all<DocumentRow>();

			for (const doc of docsResult.results || []) {
				const slugPath = normalizePath(doc.slug_path);
				if (!slugPath || slugPath === caseStudy.slug) continue;
				const rel = slugPath.startsWith(`${caseStudy.slug}/`)
					? slugPath.slice(caseStudy.slug.length + 1)
					: slugPath;
				if (!rel) continue;
				docsPaths.push(`/docs/case-studies/${caseStudy.slug}/${rel}/`);
			}
		}
	}

	const allPaths = Array.from(new Set([...staticPaths, ...contentPaths, ...docsPaths])).sort();

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
