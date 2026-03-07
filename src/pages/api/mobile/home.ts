import type { APIRoute } from 'astro';
import { fail, getWorkEntries, ok, toWorkSummary } from '../../../lib/mobile-api';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const work = await getWorkEntries();
		const featuredWork = work.filter((entry) => entry.data.featured).slice(0, 4).map(toWorkSummary);

		return ok({
			profile: {
				name: 'Tajinder Singh',
				role: 'Solutions Architect',
				tagline: 'Architecture-first systems for edge, automation, and data',
				avatarUrl: '/images/tajinder-singh-portrait.jpg',
				location: 'United Kingdom',
			},
			featuredWork,
			cta: {
				primary: { label: 'View Work', path: '/work' },
				secondary: { label: 'Contact', path: '/contact' },
			},
		});
	} catch {
		return fail(500, 'internal_error', 'Unable to load home payload');
	}
};
