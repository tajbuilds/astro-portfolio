import { joinGitBookPath, mapDocumentPage, mapNavigationNode, normalizeGitBookPath } from './mapper.ts';
import { DEFAULT_PROJECTS_PATH, resolveProjectsRoot } from './projects.ts';
import type {
  GitBookClient,
  GitBookPortfolioOptions,
  PortfolioDocumentPage,
  PortfolioNavigationNode,
} from './types.ts';

const findProject = async (
  client: GitBookClient,
  projectSlug: string,
  options: GitBookPortfolioOptions,
) => {
  const response = await client.listPages();
  const root = resolveProjectsRoot(response.pages, options.projectsPath);
  const cleanSlug = projectSlug.trim().toLowerCase();
  return (root.pages ?? []).find((page) => page.slug.toLowerCase() === cleanSlug) ?? null;
};

export const getPortfolioProjectPages = async (
  client: GitBookClient,
  projectSlug: string,
  options: GitBookPortfolioOptions = {},
): Promise<PortfolioNavigationNode[] | null> => {
  const project = await findProject(client, projectSlug, options);
  if (!project) return null;
  return (project.pages ?? []).map((page) => mapNavigationNode(page, project.path));
};

export const getPortfolioPage = async (
  client: GitBookClient,
  projectSlug: string,
  pagePath = '',
  options: GitBookPortfolioOptions = {},
): Promise<PortfolioDocumentPage | null> => {
  const project = await findProject(client, projectSlug, options);
  if (!project) return null;

  const cleanRelativePath = normalizeGitBookPath(pagePath);
  const targetPath = cleanRelativePath
    ? joinGitBookPath(project.path, cleanRelativePath)
    : project.path;

  const isWithinProject =
    targetPath === normalizeGitBookPath(project.path) ||
    targetPath.startsWith(`${normalizeGitBookPath(project.path)}/`);

  if (!isWithinProject) return null;

  const detail = await client.getPageByPath(targetPath);
  return mapDocumentPage(detail, project.path);
};

export const getConfiguredProjectsPath = (options: GitBookPortfolioOptions = {}) =>
  normalizeGitBookPath(options.projectsPath || DEFAULT_PROJECTS_PATH);
