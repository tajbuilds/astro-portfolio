import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

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
		const items = (await portfolio.getProjects()).map(toWorkSummary);
		return ok({ items });
	} catch {
		return fail(500, 'internal_error', 'Unable to load work items');
	}
};
