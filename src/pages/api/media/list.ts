import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { inferContentType, isAuthorizedMediaRequest, json, pickCollectionRoot } from './_shared';

export const prerender = false;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const GET: APIRoute = async ({ request }) => {
	if (!env.MEDIA_BUCKET) {
		return json(500, { ok: false, message: 'MEDIA_BUCKET binding is missing.' });
	}

	const configuredToken = env.MEDIA_UPLOAD_TOKEN?.trim();
	if (!configuredToken) {
		return json(500, { ok: false, message: 'MEDIA_UPLOAD_TOKEN is not configured.' });
	}

	const authCheck = isAuthorizedMediaRequest(request, configuredToken);
	if (!authCheck.ok) {
		return json(authCheck.status, { ok: false, message: authCheck.message });
	}

	const url = new URL(request.url);
	const root = pickCollectionRoot(url.searchParams.get('collection') || '') || 'shared';
	const cursor = url.searchParams.get('cursor') || undefined;
	const limit = clamp(Number(url.searchParams.get('limit') || 24), 6, 60);
	const prefix = `${root}/`;

	const listed = await env.MEDIA_BUCKET.list({
		prefix,
		cursor,
		limit,
	});

	const items = listed.objects.map((item) => {
		const key = item.key;
		const contentType = item.customMetadata?.contentType || inferContentType(key);
		const url = `/api/media/${encodeURI(key)}`;
		return {
			key,
			url,
			size: item.size,
			uploadedAt: item.customMetadata?.uploadedAt || item.uploaded?.toISOString?.() || null,
			contentType,
			isImage: contentType.startsWith('image/'),
		};
	});

	return json(200, {
		ok: true,
		items,
		nextCursor: listed.truncated ? listed.cursor : null,
		root,
	});
};
