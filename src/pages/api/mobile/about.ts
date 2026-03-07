import type { APIRoute } from 'astro';
import { fail, ok } from '../../../lib/mobile-api';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		return ok({
			about: {
				name: 'Tajinder Singh',
				headline: 'Solutions Architect',
				bio: 'Solutions architect focused on edge verification, automation-first flows, and operationally reliable data systems.',
				skills: [
					'Cloudflare Workers',
					'n8n',
					'TypeScript',
					'Meilisearch',
					'Xano',
				],
				focusAreas: ['Edge systems', 'Automation', 'Search and data platforms'],
				avatarUrl: '/images/tajinder-singh-portrait.jpg',
				social: [
					{ label: 'GitHub', url: 'https://github.com/tajbuilds' },
					{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/taj-tajinder/' },
				],
			},
		});
	} catch {
		return fail(500, 'internal_error', 'Unable to load about payload');
	}
};
