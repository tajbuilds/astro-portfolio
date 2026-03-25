import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const MIN_NAME_LEN = 2;
const MAX_NAME_LEN = 120;
const MAX_EMAIL_LEN = 190;

const json = (status: number, payload: Record<string, unknown>) =>
	new Response(JSON.stringify(payload), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	});

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseInput = async (request: Request) => {
	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
	return {
		name: clean(body.name),
		email: clean(body.email),
		message: clean(body.message),
		company: clean(body.company),
	};
};

export const POST: APIRoute = async ({ request }) => {
	if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
		return json(500, { ok: false, message: 'Email service is not configured yet.' });
	}

	const { name, email, message, company } = await parseInput(request);

	if (company) {
		return json(200, { ok: true, message: 'Message sent.' });
	}

	if (!name || name.length < MIN_NAME_LEN || name.length > MAX_NAME_LEN) {
		return json(400, { ok: false, message: 'Please enter your full name (at least 2 characters).' });
	}

	if (!email || email.length > MAX_EMAIL_LEN || !validEmail(email)) {
		return json(400, { ok: false, message: 'Please enter a valid email address.' });
	}

	if (!message) {
		return json(400, { ok: false, message: 'Please enter your message.' });
	}

	const subjectPrefix = env.CONTACT_SUBJECT_PREFIX || '[Contact Form]';
	const subject = `${subjectPrefix} ${name}`;

	const html = `
		<h2>New mobile contact form message</h2>
		<p><strong>Name:</strong> ${escapeHtml(name)}</p>
		<p><strong>Email:</strong> ${escapeHtml(email)}</p>
		<p><strong>Message:</strong></p>
		<p>${escapeHtml(message).replaceAll('\n', '<br/>')}</p>
	`;

	const text = [
		'New mobile contact form message',
		`Name: ${name}`,
		`Email: ${email}`,
		'',
		'Message:',
		message,
	].join('\n');

	const resendResponse = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			from: env.CONTACT_FROM_EMAIL,
			to: [env.CONTACT_TO_EMAIL],
			reply_to: email,
			subject,
			html,
			text,
		}),
	});

	if (!resendResponse.ok) {
		const errorText = await resendResponse.text().catch(() => 'unknown resend error');
		console.error('Mobile Resend send failed', {
			status: resendResponse.status,
			body: errorText,
		});
		return json(502, {
			ok: false,
			message: 'Email provider rejected this message. Check sender/domain verification in Resend.',
		});
	}

	return json(200, { ok: true, message: 'Message sent successfully.' });
};
