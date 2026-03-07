import type { APIRoute } from 'astro';
import { fail, getWorkEntries, ok, toWorkDetail } from '../../../../lib/mobile-api';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	try {
		const slug = params.slug?.trim().toLowerCase();
		if (!slug) {
			return fail(404, 'not_found', 'Work item not found');
		}

		const item = (await getWorkEntries()).find(
			(entry) => entry.id.replace(/\.(md|mdx)$/i, '').toLowerCase() === slug,
		);

		if (!item) {
			return fail(404, 'not_found', 'Work item not found');
		}

		return ok({ item: toWorkDetail(item) });
	} catch {
		return fail(500, 'internal_error', 'Unable to load work item');
	}
};
