import { findPageByPath, mapProject, mapProjectSummary, normalizeGitBookPath } from './mapper.ts';
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
