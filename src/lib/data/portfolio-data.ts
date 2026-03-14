import { type CollectionEntry, getCollection } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;

export const contentSlug = (id: string) => id.replace(/\.(md|mdx)$/i, '');
export const slugifyTag = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const profileData = {
	name: 'Tajinder Singh',
	role: 'Solutions Architect',
	tagline: 'Architecture-first systems for edge, automation, and data',
	avatarUrl: '/images/tajinder-singh-portrait.jpg',
	location: 'United Kingdom',
} as const;

export const ctaData = {
	primary: { label: 'View Work', path: '/work' },
	secondary: { label: 'Contact', path: '/contact' },
} as const;

export const aboutData = {
	name: 'Tajinder Singh',
	headline: 'Solutions Architect',
	bio: 'Solutions architect focused on edge verification, automation-first flows, and operationally reliable data systems.',
	skills: ['Cloudflare Workers', 'n8n', 'TypeScript', 'Meilisearch', 'Xano'],
	focusAreas: ['Edge systems', 'Automation', 'Search and data platforms'],
	avatarUrl: '/images/tajinder-singh-portrait.jpg',
	social: [
		{ label: 'GitHub', url: 'https://github.com/tajbuilds' },
		{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/taj-tajinder/' },
	],
} as const;

export const contactData = {
	email: 'contact@tajs.io',
	formPath: '/api/contact',
	turnstileRequired: true,
	links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/taj-tajinder/' }],
} as const;

export const privacyData = {
	lastUpdated: '14 March 2026',
	introduction: [
		'This Privacy Policy explains how tajs.io handles personal data for the website and contact workflows.',
		'Tajs.io is operated by Tajinder Singh as a personal portfolio showcasing architecture, engineering projects, and technical case studies.',
		'The policy is designed to align with UK GDPR and the Privacy and Electronic Communications Regulations (PECR), including consent requirements for non-essential analytics technologies.',
	],
	sections: [
		{
			title: 'Who Controls Your Data',
			paragraphs: [
				'Data controller: Tajinder Singh (tajs.io).',
				'If you have a privacy request, contact details are listed at the bottom of this page.',
			],
		},
		{
			title: 'Information We Collect',
			items: [
				{
					heading: 'Information you provide directly',
					paragraphs: [
						'Browsing does not require an account.',
						'If you submit the contact form, the submitted details (such as name, email address, and message content) are processed to respond to your enquiry.',
					],
				},
				{
					heading: 'Technical and operational data',
					paragraphs: [
						'When you visit the site, hosting and security services process technical request data so the service can operate safely and reliably.',
						'This data is used for service delivery, abuse prevention, debugging, and performance monitoring.',
					],
					bullets: [
						'IP address',
						'Browser or device type',
						'Operating system',
						'Pages visited',
						'Time and date of requests',
					],
				},
			],
		},
		{
			title: 'Legal Bases for Processing (UK GDPR)',
			paragraphs: [
				'Contractual necessity: to respond to contact requests you submit.',
				'Legitimate interests: to secure, operate, and improve website reliability and performance.',
				'Consent: for non-essential analytics, which are enabled only after an explicit Accept action.',
			],
		},
		{
			title: 'Third-Party Processors and Services',
			paragraphs: [
				'Trusted infrastructure and software providers are used to operate the website and contact workflows.',
				'These providers may process limited data on behalf of tajs.io to deliver hosting, security, anti-abuse, email delivery, and analytics functionality.',
			],
			bullets: [
				'Cloudflare: hosting, caching, security, and bot mitigation',
				'Cloudflare Turnstile: anti-spam and bot checks for forms',
				'Resend (or configured email provider): contact form email delivery',
				'GitHub: source code and deployment workflows',
				'Matomo (self-hosted at stats.tajs.io): website analytics after consent',
			],
		},
		{
			title: 'Cookies and Tracking',
			paragraphs: [
				'Non-essential analytics tracking is disabled by default. Matomo is loaded only if you provide an unambiguous opt-in by clicking Accept on the analytics banner.',
				'If you click Reject, analytics tracking is not loaded.',
				'You can revisit or change this choice using Analytics settings in the site footer.',
				'Technically necessary storage or cookies may still be used for core security and service operation (for example anti-abuse protection).',
				'No advertising cookies, cross-site ad identifiers, or behavioural advertising profiling are used.',
			],
		},
		{
			title: 'Data Retention',
			paragraphs: [
				'Contact form messages are kept only as long as reasonably necessary to handle enquiries and related follow-up.',
				'Operational and security logs are retained for limited periods appropriate for security, incident response, and platform reliability.',
				'Analytics data retention is controlled in Matomo settings and reviewed periodically.',
			],
		},
		{
			title: 'International Data Transfers',
			paragraphs: [
				'Some service providers may process data in countries outside the UK.',
				'Where transfers occur, appropriate safeguards are used under applicable data protection law (for example contractual protections and provider security controls).',
			],
		},
		{
			title: 'Your Rights',
			paragraphs: [
				'Under UK GDPR, you may have rights including access, rectification, erasure, restriction, objection, and data portability (where applicable).',
				'To exercise your rights, contact the email address listed below. Requests are handled in line with applicable legal timelines.',
			],
		},
		{
			title: 'Complaints',
			paragraphs: [
				'If you are not satisfied with how your data is handled, you can raise a concern with the UK Information Commissioner’s Office (ICO): https://ico.org.uk/make-a-complaint/.',
			],
		},
		{
			title: "Children's Privacy",
			paragraphs: [
				'This website is not directed at children under 13, and personal data is not knowingly collected from children.',
			],
		},
		{
			title: 'Security',
			paragraphs: [
				'Appropriate technical and organisational measures are used to reduce risks such as unauthorised access, misuse, and service abuse.',
				'No internet service can be guaranteed to be fully secure.',
			],
		},
		{
			title: 'Changes to This Policy',
			paragraphs: [
				'This policy may be updated to reflect legal, technical, or service changes.',
				'The Last updated date is revised when material updates are made.',
			],
		},
	],
	contact: {
		name: 'Tajinder Singh',
		website: 'https://tajs.io',
		email: 'contact@tajs.io',
	},
} as const;

export const getPublishedWorkEntries = async () =>
	(await getCollection('work'))
		.filter((entry) => !entry.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const getFeaturedWorkEntries = async (limit = 4) =>
	(await getPublishedWorkEntries()).filter((entry) => entry.data.featured).slice(0, limit);

export const getPublishedWorkTags = async () =>
	Array.from(
		new Set((await getPublishedWorkEntries()).flatMap((item) => item.data.tags).map((tag) => tag.trim())),
	).sort((a, b) => a.localeCompare(b));

export const getWorkEntryBySlug = async (slug: string) =>
	(await getPublishedWorkEntries()).find((entry) => contentSlug(entry.id).toLowerCase() === slug.toLowerCase());
