import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

import {
	createMobilePortfolio,
	fail,
	ok,
	toWorkDetail,
} from '../../../../lib/mobile-api';
import type { GitBookRuntimeEnv } from '../../../../lib/gitbook';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	try {
		const slug = params.slug?.trim().toLowerCase();
		if (!slug) {
			return fail(404, 'not_found', 'Work item not found');
		}

		const portfolio = createMobilePortfolio(env as unknown as GitBookRuntimeEnv);
		const item = await portfolio.getProject(slug);

		if (!item) {
			return fail(404, 'not_found', 'Work item not found');
		}

		return ok({ item: toWorkDetail(item) });
	} catch {
		return fail(500, 'internal_error', 'Unable to load work item');
	}
};
