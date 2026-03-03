import type { APIRoute } from 'astro';

export const prerender = false;

const notFound = () =>
	new Response('Not found', {
		status: 404,
		headers: { 'cache-control': 'no-store' },
	});

export const GET: APIRoute = async ({ params, locals }) => {
	const env = locals.runtime.env;
	const rawKey = params.key || '';
	const key = rawKey.replace(/^\/+/, '').trim();

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
