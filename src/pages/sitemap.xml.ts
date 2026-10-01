import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

import {
	createGitBookPortfolioFromEnv,
	normalizeProjectTagKey,
	type GitBookRuntimeEnv,
	type PortfolioNavigationNode,
	type PortfolioProjectSummary,
} from '../lib/gitbook';

export const prerender = false;

const toUrl = (origin: string, path: string) => `${origin}${path}`;

const xmlEscape = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

const encodeRelativePath = (value: string) =>
	value
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');

const appendProjectPaths = (
	paths: string[],
	project: PortfolioProjectSummary,
	nodes: PortfolioNavigationNode[],
) => {
	const projectPath = `/work/${encodeURIComponent(project.slug)}/`;
	paths.push(projectPath);

	const walk = (items: PortfolioNavigationNode[]) => {
		for (const item of items) {
			const relativePath = encodeRelativePath(item.relativePath);
			if (relativePath) paths.push(`${projectPath}${relativePath}/`);
			if (item.children.length) walk(item.children);
		}
	};

	walk(nodes);
};

export const GET: APIRoute = async ({ request }) => {
	const origin = new URL(request.url).origin;
	const staticPaths = ['/', '/about/', '/contact/', '/work/'];
	const contentPaths: string[] = [];
	const gitbookEnv = env as unknown as GitBookRuntimeEnv;

	if (gitbookEnv.GITBOOK_TOKEN?.trim()) {
		try {
			const portfolio = createGitBookPortfolioFromEnv(gitbookEnv);
			const [projects, tags] = await Promise.all([
				portfolio.getProjects(),
				portfolio.getProjectTags(),
			]);

			const navigation = await Promise.all(
				projects.map((project) => portfolio.getProjectPages(project.slug)),
			);

			projects.forEach((project, index) => {
				appendProjectPaths(contentPaths, project, navigation[index] ?? []);
			});

			for (const tag of tags) {
				const tagKey = normalizeProjectTagKey(tag);
				if (tagKey) contentPaths.push(`/work/tags/${encodeURIComponent(tagKey)}/`);
			}
		} catch (error) {
			console.error('GitBook sitemap discovery failed.', error);
		}
	}

	const allPaths = Array.from(new Set([...staticPaths, ...contentPaths])).sort();

	const urls = allPaths
		.map((path) => `  <url><loc>${xmlEscape(toUrl(origin, path))}</loc></url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600',
		},
	});
};
