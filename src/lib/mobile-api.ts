import { type CollectionEntry, getCollection } from 'astro:content';

export const MOBILE_API_VERSION = '1.0';
export const MOBILE_READ_CACHE =
	'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

type WorkEntry = CollectionEntry<'work'>;

const contentSlug = (id: string) => id.replace(/\.(md|mdx)$/i, '');
const isoDate = (value: Date) => value.toISOString().slice(0, 10);

const pickSection = (sections: Record<string, string>, keys: string[]) => {
	for (const key of keys) {
		if (sections[key]) return sections[key];
	}
	return '';
};

const parseSections = (markdown: string) => {
	const sectionRegex = /^##\s+(.+)\n([\s\S]*?)(?=^##\s+|\Z)/gm;
	const sections: Record<string, string> = {};

	let match: RegExpExecArray | null;
	while ((match = sectionRegex.exec(markdown)) !== null) {
		const heading = match[1].trim().toLowerCase();
		const body = match[2].trim();
		sections[heading] = body;
	}

	return sections;
};

export const ok = (payload: Record<string, unknown>, cacheControl = MOBILE_READ_CACHE) =>
	new Response(
		JSON.stringify({
			version: MOBILE_API_VERSION,
			generatedAt: new Date().toISOString(),
			...payload,
		}),
		{
			status: 200,
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'cache-control': cacheControl,
			},
		},
	);

export const fail = (status: number, code: string, message: string) =>
	new Response(
		JSON.stringify({
			version: MOBILE_API_VERSION,
			error: { code, message },
		}),
		{
			status,
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'cache-control': 'no-store',
			},
		},
	);

export const getWorkEntries = async () =>
	(await getCollection('work'))
		.filter((entry) => !entry.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export const toWorkSummary = (entry: WorkEntry) => ({
	slug: contentSlug(entry.id),
	title: entry.data.title,
	summary: entry.data.description,
	tags: entry.data.tags,
	role: 'Solutions Architect',
	timeline: String(entry.data.date.getUTCFullYear()),
	coverImageUrl: '/blog-placeholder-1.jpg',
	publishedAt: isoDate(entry.data.date),
	updatedAt: isoDate(entry.data.date),
});

export const toWorkDetail = (entry: WorkEntry) => {
	const sections = parseSections(entry.body);
	return {
		...toWorkSummary(entry),
		content: {
			format: 'markdown',
			body: entry.body,
		},
		sections: {
			context: pickSection(sections, ['tl;dr', 'problem']),
			constraints: pickSection(sections, ['constraints']),
			approach: pickSection(sections, ['architecture', 'key decisions']),
			outcome: pickSection(sections, ['results']),
			learnings: pickSection(sections, ['future enhancements', 'next improvements']),
		},
		links: {
			liveDemo: null,
			repository: entry.data.github ?? null,
		},
	};
};
