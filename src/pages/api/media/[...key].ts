import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isAuthorizedMediaRequest, json } from './_shared';

export const prerender = false;

const notFound = () =>
	new Response('Not found', {
		status: 404,
		headers: { 'cache-control': 'no-store' },
	});

export const GET: APIRoute = async ({ params }) => {
	const rawKey = params.key || '';
	const key = decodeURIComponent(rawKey).replace(/^\/+/, '').trim();

	if (!env.MEDIA_BUCKET || !key) {
		return notFound();
	}

	const object = await env.MEDIA_BUCKET.get(key);
	if (!object || !object.body) {
		return notFound();
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('cache-control', headers.get('cache-control') || 'public, max-age=3600');

	return new Response(object.body, {
		status: 200,
		headers,
	});
};

export const DELETE: APIRoute = async ({ params, request }) => {
	const rawKey = params.key || '';
	const key = decodeURIComponent(rawKey).replace(/^\/+/, '').trim();

	if (!env.MEDIA_BUCKET || !key) {
		return notFound();
	}

	const configuredToken = env.MEDIA_UPLOAD_TOKEN?.trim();
	if (!configuredToken) {
		return json(500, { ok: false, message: 'MEDIA_UPLOAD_TOKEN is not configured.' });
	}

	const authCheck = isAuthorizedMediaRequest(request, configuredToken);
	if (!authCheck.ok) {
		return json(authCheck.status, { ok: false, message: authCheck.message });
	}

	await env.MEDIA_BUCKET.delete(key);
	return json(200, { ok: true, key });
};
