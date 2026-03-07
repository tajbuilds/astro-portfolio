import type { APIRoute } from 'astro';
import { fail, ok } from '../../../lib/mobile-api';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		return ok({
			contact: {
				email: 'contact@tajs.io',
				formPath: '/api/contact',
				turnstileRequired: true,
				links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/taj-tajinder/' }],
			},
		});
	} catch {
		return fail(500, 'internal_error', 'Unable to load contact payload');
	}
};
