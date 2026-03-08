import type { APIRoute } from 'astro';
import { fail, ok } from '../../../lib/mobile-api';
import { aboutData } from '../../../lib/data/portfolio-data';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		return ok({ about: aboutData });
	} catch {
		return fail(500, 'internal_error', 'Unable to load about payload');
	}
};
