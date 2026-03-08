import type { APIRoute } from 'astro';
import { fail, ok } from '../../../lib/mobile-api';
import { contactData } from '../../../lib/data/portfolio-data';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		return ok({
			contact: {
				...contactData,
				formPath: '/api/mobile/contact/submit',
				turnstileRequired: false,
			},
		});
	} catch {
		return fail(500, 'internal_error', 'Unable to load contact payload');
	}
};
