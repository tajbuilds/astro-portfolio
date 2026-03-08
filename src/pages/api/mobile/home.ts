import type { APIRoute } from 'astro';
import { fail, getWorkEntries, ok, toWorkSummary } from '../../../lib/mobile-api';
import { ctaData, profileData } from '../../../lib/data/portfolio-data';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const work = await getWorkEntries();
		const featuredWork = work.filter((entry) => entry.data.featured).slice(0, 4).map(toWorkSummary);

		return ok({
			profile: profileData,
			featuredWork,
			cta: ctaData,
		});
	} catch {
		return fail(500, 'internal_error', 'Unable to load home payload');
	}
};
