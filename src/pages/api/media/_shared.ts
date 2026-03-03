export const ALLOWED_ROOTS = new Set(['blog', 'work', 'shared']);

export const json = (status: number, payload: Record<string, unknown>) =>
	new Response(JSON.stringify(payload), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	});

export const parseCookies = (cookieHeader: string | null) =>
	(cookieHeader || '')
		.split(';')
		.map((part) => part.trim())
		.filter(Boolean)
		.reduce<Record<string, string>>((acc, part) => {
			const idx = part.indexOf('=');
			if (idx <= 0) return acc;
			const key = decodeURIComponent(part.slice(0, idx).trim());
			const value = decodeURIComponent(part.slice(idx + 1).trim());
			acc[key] = value;
			return acc;
		}, {});

export const sanitizeKey = (value: string) =>
	value
		.trim()
		.replaceAll('\\', '/')
		.replace(/^\/+/, '')
		.replace(/\.\.+/g, '.')
		.replace(/\/{2,}/g, '/');

export const pickCollectionRoot = (value: string) => {
	const candidate = sanitizeKey(value).toLowerCase();
	if (!candidate) return '';
	const root = candidate.split('/')[0];
	return ALLOWED_ROOTS.has(root) ? root : '';
};

export const resolveUploadFolder = (formData: FormData) => {
	const collection = sanitizeKey(String(formData.get('collection') || '')).toLowerCase();
	const folder = sanitizeKey(String(formData.get('folder') || '')).toLowerCase();
	const candidate = collection || folder || 'shared';
	const root = candidate.split('/')[0];
	if (!ALLOWED_ROOTS.has(root)) return null;
	return candidate;
};

export const isAuthorizedMediaRequest = (request: Request, configuredToken: string) => {
	const authHeader = request.headers.get('authorization') || '';
	const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
	const cookieToken = parseCookies(request.headers.get('cookie'))['cms_media_token']?.trim() || '';

	const hasBearerAuth = providedToken === configuredToken;
	const hasCookieAuth = cookieToken === configuredToken;
	if (!hasBearerAuth && !hasCookieAuth) {
		return { ok: false, status: 401, message: 'Unauthorized media access.' };
	}

	const method = request.method.toUpperCase();
	const requiresSameOriginCheck = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

	if (hasCookieAuth && requiresSameOriginCheck) {
		const requestOrigin = new URL(request.url).origin;
		const originHeader = request.headers.get('origin') || '';
		const refererHeader = request.headers.get('referer') || '';
		const sameOrigin =
			(originHeader && originHeader === requestOrigin) ||
			(refererHeader && refererHeader.startsWith(`${requestOrigin}/`));
		if (!sameOrigin) {
			return { ok: false, status: 403, message: 'Cross-origin media access is blocked.' };
		}
	}

	return { ok: true };
};

export const inferContentType = (key: string) => {
	const lower = key.toLowerCase();
	if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
	if (lower.endsWith('.png')) return 'image/png';
	if (lower.endsWith('.webp')) return 'image/webp';
	if (lower.endsWith('.svg')) return 'image/svg+xml';
	if (lower.endsWith('.gif')) return 'image/gif';
	if (lower.endsWith('.pdf')) return 'application/pdf';
	return 'application/octet-stream';
};
