import type { APIRoute } from 'astro';
import { fail, getWorkEntries, ok, toWorkSummary } from '../../../lib/mobile-api';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const items = (await getWorkEntries()).map(toWorkSummary);
		return ok({ items });
	} catch {
		return fail(500, 'internal_error', 'Unable to load work items');
	}
};
