import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const json = (status: number, payload: Record<string, unknown>) =>
	new Response(JSON.stringify(payload), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	});

const sanitizeKey = (value: string) =>
	value
		.trim()
		.replaceAll('\\', '/')
		.replace(/^\/+/, '')
		.replace(/\.\.+/g, '.')
		.replace(/\/{2,}/g, '/');

const extensionFor = (contentType: string) => {
	switch (contentType) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/png':
			return 'png';
		case 'image/webp':
			return 'webp';
		case 'image/svg+xml':
			return 'svg';
		case 'application/pdf':
			return 'pdf';
		default:
			return 'bin';
	}
};

export const POST: APIRoute = async ({ request, locals }) => {
	const env = locals.runtime.env;

	if (!env.MEDIA_BUCKET) {
		return json(500, { ok: false, message: 'MEDIA_BUCKET binding is missing.' });
	}

	const configuredToken = env.MEDIA_UPLOAD_TOKEN?.trim();
	if (!configuredToken) {
		return json(500, { ok: false, message: 'MEDIA_UPLOAD_TOKEN is not configured.' });
	}

	const authHeader = request.headers.get('authorization') || '';
	const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
	if (!providedToken || providedToken !== configuredToken) {
		return json(401, { ok: false, message: 'Unauthorized media upload.' });
	}

	const contentType = request.headers.get('content-type') || '';
	if (!contentType.includes('multipart/form-data')) {
		return json(415, { ok: false, message: 'Use multipart/form-data.' });
	}

	const formData = await request.formData();
	const file = formData.get('file');
	if (!(file instanceof File)) {
		return json(400, { ok: false, message: 'Missing file field.' });
	}

	if (file.size <= 0 || file.size > MAX_BYTES) {
		return json(400, { ok: false, message: `File must be between 1 byte and ${MAX_BYTES} bytes.` });
	}

	const folder = sanitizeKey(String(formData.get('folder') || 'uploads'));
	const baseName = sanitizeKey(String(formData.get('name') || '')).replace(/\.[^.]+$/, '');
	const ext = extensionFor(file.type || 'application/octet-stream');
	const stamp = new Date().toISOString().replaceAll(':', '-');
	const safeName = (baseName || `asset-${stamp}`).replace(/[^a-zA-Z0-9._/-]/g, '-');
	const key = `${folder}/${safeName}.${ext}`.replace(/\/{2,}/g, '/');

	await env.MEDIA_BUCKET.put(key, file.stream(), {
		httpMetadata: {
			contentType: file.type || 'application/octet-stream',
			cacheControl: 'public, max-age=31536000, immutable',
		},
		customMetadata: {
			uploadedAt: new Date().toISOString(),
			uploadedBy: 'api-media-upload',
		},
	});

	return json(201, {
		ok: true,
		key,
		url: `/api/media/${encodeURI(key)}`,
	});
};
