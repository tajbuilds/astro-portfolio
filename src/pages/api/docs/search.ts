import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

type SearchRow = {
	case_slug: string;
	case_title: string;
	doc_title: string;
	slug_path: string;
	excerpt: string | null;
};

const json = (status: number, payload: Record<string, unknown>) =>
	new Response(JSON.stringify(payload), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	});

const clean = (value: string | null) => (value || '').trim();

const normalizeQuery = (value: string) =>
	value
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();

const normalizePath = (value: string | null | undefined) =>
	(value || '').trim().replace(/^\/+|\/+$/g, '');

export const GET: APIRoute = async ({ url }) => {
	const db = env.DB as D1Database | undefined;
	if (!db) return json(500, { ok: false, message: "D1 binding 'DB' is missing on this environment." });

	const q = normalizeQuery(clean(url.searchParams.get('q')));
	const caseSlug = clean(url.searchParams.get('case'));
	const limitRaw = Number(url.searchParams.get('limit') || 10);
	const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(20, Math.floor(limitRaw))) : 10;

	if (q.length < 2) {
		return json(200, { ok: true, items: [] });
	}

	const likeTerm = `%${q}%`;

	const query = caseSlug
		? db
				.prepare(
					`SELECT cs.slug AS case_slug,
					        cs.title AS case_title,
					        d.title AS doc_title,
					        d.slug_path AS slug_path,
					        d.excerpt AS excerpt
					 FROM documents d
					 JOIN case_studies cs ON cs.id = d.case_study_id
					 WHERE cs.is_visible = 1
					   AND cs.slug = ?1
					   AND (
						 LOWER(d.title) LIKE ?2
						 OR LOWER(COALESCE(d.excerpt, '')) LIKE ?2
						 OR LOWER(COALESCE(d.body_md, '')) LIKE ?2
					   )
					 ORDER BY
					   CASE WHEN LOWER(d.title) LIKE ?3 THEN 0 ELSE 1 END,
					   d.nav_order ASC,
					   d.title ASC
					 LIMIT ?4`
				)
				.bind(caseSlug, likeTerm, `${q}%`, limit)
		: db
				.prepare(
					`SELECT cs.slug AS case_slug,
					        cs.title AS case_title,
					        d.title AS doc_title,
					        d.slug_path AS slug_path,
					        d.excerpt AS excerpt
					 FROM documents d
					 JOIN case_studies cs ON cs.id = d.case_study_id
					 WHERE cs.is_visible = 1
					   AND (
						 LOWER(d.title) LIKE ?1
						 OR LOWER(COALESCE(d.excerpt, '')) LIKE ?1
						 OR LOWER(COALESCE(d.body_md, '')) LIKE ?1
					   )
					 ORDER BY
					   CASE WHEN LOWER(d.title) LIKE ?2 THEN 0 ELSE 1 END,
					   cs.nav_order ASC,
					   d.nav_order ASC,
					   d.title ASC
					 LIMIT ?3`
				)
				.bind(likeTerm, `${q}%`, limit);

	const result = await query.all<SearchRow>();
	const rows = result.results || [];

	const items = rows.map((row) => {
		const slugPath = normalizePath(row.slug_path);
		const rel = slugPath.startsWith(`${row.case_slug}/`)
			? slugPath.slice(row.case_slug.length + 1)
			: slugPath === row.case_slug
				? ''
				: slugPath;
		const href = rel
			? `/docs/case-studies/${row.case_slug}/${rel}/`
			: `/docs/case-studies/${row.case_slug}/`;
		return {
			title: row.doc_title,
			caseTitle: row.case_title,
			href,
			excerpt: row.excerpt || '',
		};
	});

	return json(200, { ok: true, items });
};
