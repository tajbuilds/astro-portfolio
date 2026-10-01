import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

import { ctaData, profileData } from '../../../lib/data/site-data';
import {
	createMobilePortfolio,
	fail,
	ok,
	toWorkSummary,
} from '../../../lib/mobile-api';
import type { GitBookRuntimeEnv } from '../../../lib/gitbook';

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const portfolio = createMobilePortfolio(env as unknown as GitBookRuntimeEnv);
		const featuredWork = (await portfolio.getShowcaseProjects(4)).map(toWorkSummary);

		return ok({
			profile: profileData,
			featuredWork,
			cta: ctaData,
		});
	} catch {
		return fail(500, 'internal_error', 'Unable to load home payload');
	}
};
