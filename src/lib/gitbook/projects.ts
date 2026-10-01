import {
  findPageByPath,
  mapProject,
  mapProjectSummary,
  normalizeGitBookPath,
  normalizeProjectTagKey,
} from './mapper.ts';
import type {
  GitBookClient,
  GitBookPageTreeNode,
  GitBookPortfolioOptions,
  PortfolioProject,
  PortfolioProjectSummary,
} from './types.ts';

export const DEFAULT_PROJECTS_PATH = 'projects';

export class GitBookContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitBookContentError';
  }
}

export const resolveProjectsRoot = (
  pages: GitBookPageTreeNode[],
  projectsPath = DEFAULT_PROJECTS_PATH,
) => {
  const root = findPageByPath(pages, projectsPath);
  if (!root) {
    throw new GitBookContentError(
      `GitBook projects root "${normalizeGitBookPath(projectsPath)}" was not found.`,
    );
  }
  return root;
};

export const listPortfolioProjects = async (
  client: GitBookClient,
  options: GitBookPortfolioOptions = {},
): Promise<PortfolioProjectSummary[]> => {
  const response = await client.listPages();
  const root = resolveProjectsRoot(response.pages, options.projectsPath);
  return (root.pages ?? []).map((page, index) => mapProjectSummary(page, index));
};

export const getPortfolioProject = async (
  client: GitBookClient,
  projectSlug: string,
  options: GitBookPortfolioOptions = {},
): Promise<PortfolioProject | null> => {
  const response = await client.listPages();
  const root = resolveProjectsRoot(response.pages, options.projectsPath);
  const cleanSlug = projectSlug.trim().toLowerCase();
  const projectIndex = (root.pages ?? []).findIndex((page) => page.slug.toLowerCase() === cleanSlug);
  if (projectIndex < 0) return null;

  const projectTree = root.pages![projectIndex];
  const detailPage = await client.getPageById(projectTree.id);
  return mapProject(projectTree, detailPage, projectIndex);
};


export const listShowcasePortfolioProjects = async (
  client: GitBookClient,
  limit = 2,
  options: GitBookPortfolioOptions = {},
): Promise<PortfolioProjectSummary[]> => {
  const projects = await listPortfolioProjects(client, options);
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  return projects.filter((project) => project.showcase).slice(0, safeLimit);
};

export const listPortfolioProjectTags = async (
  client: GitBookClient,
  options: GitBookPortfolioOptions = {},
): Promise<string[]> => {
  const projects = await listPortfolioProjects(client, options);
  const tags = new Map<string, string>();

  for (const project of projects) {
    for (const tag of project.tags) {
      const key = normalizeProjectTagKey(tag);
      if (key && !tags.has(key)) tags.set(key, tag);
    }
  }

  return Array.from(tags.values()).sort((a, b) => a.localeCompare(b));
};

export const listPortfolioProjectsByTag = async (
  client: GitBookClient,
  tag: string,
  options: GitBookPortfolioOptions = {},
): Promise<PortfolioProjectSummary[]> => {
  const target = normalizeProjectTagKey(tag);
  if (!target) return [];

  const projects = await listPortfolioProjects(client, options);
  return projects.filter((project) =>
    project.tags.some((projectTag) => normalizeProjectTagKey(projectTag) === target),
  );
};
