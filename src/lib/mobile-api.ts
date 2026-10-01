import {
	createGitBookPortfolioFromEnv,
	formatProjectTagLabel,
	type GitBookPortfolio,
	type GitBookRuntimeEnv,
	type PortfolioNavigationNode,
	type PortfolioProject,
	type PortfolioProjectSummary,
} from './gitbook/index.ts';

export const MOBILE_API_VERSION = '2.0';
export const MOBILE_READ_CACHE =
	'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

const DEFAULT_COVER_IMAGE = '/images/work-default-cover.svg';

const pickSection = (sections: Record<string, string>, keys: string[]) => {
	for (const key of keys) {
		if (sections[key]) return sections[key];
	}
	return '';
};

const parseSections = (markdown: string) => {
	const sectionRegex = /^##\s+(.+)\r?\n([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm;
	const sections: Record<string, string> = {};

	let match: RegExpExecArray | null;
	while ((match = sectionRegex.exec(markdown)) !== null) {
		const heading = match[1].trim().toLowerCase();
		const body = match[2].trim();
		sections[heading] = body;
	}

	return sections;
};

const flattenNavigation = (nodes: PortfolioNavigationNode[]): PortfolioNavigationNode[] =>
	nodes.flatMap((node) => [node, ...flattenNavigation(node.children)]);

const projectHref = (slug: string) => `/work/${encodeURIComponent(slug)}/`;

const pageHref = (projectSlug: string, relativePath: string) =>
	`${projectHref(projectSlug)}${relativePath
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/')}/`;

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

export const createMobilePortfolio = (runtimeEnv: GitBookRuntimeEnv): GitBookPortfolio => {
	if (!runtimeEnv.GITBOOK_TOKEN?.trim()) {
		throw new Error('GitBook portfolio is not configured.');
	}

	return createGitBookPortfolioFromEnv(runtimeEnv);
};

export const toWorkSummary = (project: PortfolioProjectSummary) => ({
	slug: project.slug,
	title: project.title,
	summary: project.description,
	tags: project.tags.map(formatProjectTagLabel),
	role: 'Solutions Architect',
	timeline: null,
	coverImageUrl: DEFAULT_COVER_IMAGE,
	publishedAt: null,
	updatedAt: null,
	href: projectHref(project.slug),
});

export const toWorkDetail = (project: PortfolioProject) => {
	const sections = parseSections(project.markdown);

	return {
		...toWorkSummary(project),
		content: {
			format: 'markdown',
			body: project.markdown,
		},
		sections: {
			context: pickSection(sections, [
				'executive overview',
				'context',
				'problem',
				'why the problem mattered',
			]),
			constraints: pickSection(sections, ['constraints', 'architectural responsibility']),
			approach: pickSection(sections, [
				'architecture at a glance',
				'architecture',
				'approach',
				'target architecture',
			]),
			outcome: pickSection(sections, ['outcome', 'results', 'validation & outcomes']),
			learnings: pickSection(sections, [
				'lessons learned',
				'learnings',
				'future enhancements',
				'next improvements',
			]),
		},
		pages: flattenNavigation(project.navigation).map((page) => ({
			title: page.title,
			summary: page.description,
			path: page.relativePath,
			href: pageHref(project.slug, page.relativePath),
		})),
		links: {
			liveDemo: null,
			repository: null,
		},
	};
};
