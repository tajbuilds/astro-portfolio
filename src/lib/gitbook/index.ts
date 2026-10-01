import { createGitBookClientFromEnv } from './client.ts';
import { getPortfolioPage, getPortfolioProjectPages } from './pages.ts';
import { getPortfolioProject, listPortfolioProjects } from './projects.ts';
import type {
  GitBookClient,
  GitBookPortfolio,
  GitBookPortfolioOptions,
  GitBookRuntimeEnv,
} from './types.ts';

export { createGitBookClient, createGitBookClientFromEnv, GitBookApiError } from './client.ts';
export { getPortfolioPage, getPortfolioProjectPages } from './pages.ts';
export {
  DEFAULT_PROJECTS_PATH,
  GitBookContentError,
  getPortfolioProject,
  listPortfolioProjects,
} from './projects.ts';
export {
  countDescendants,
  findPageByPath,
  joinGitBookPath,
  mapDocumentPage,
  mapNavigationNode,
  mapProject,
  mapProjectSummary,
  normalizeGitBookPath,
} from './mapper.ts';
export type * from './types.ts';

export const createGitBookPortfolio = (
  client: GitBookClient,
  options: GitBookPortfolioOptions = {},
): GitBookPortfolio => ({
  getProjects: () => listPortfolioProjects(client, options),
  getProject: (projectSlug) => getPortfolioProject(client, projectSlug, options),
  getProjectPages: (projectSlug) => getPortfolioProjectPages(client, projectSlug, options),
  getPage: (projectSlug, pagePath) => getPortfolioPage(client, projectSlug, pagePath, options),
});

export const createGitBookPortfolioFromEnv = (
  env: GitBookRuntimeEnv,
  options: GitBookPortfolioOptions = {},
) => {
  const client = createGitBookClientFromEnv(env);
  return createGitBookPortfolio(client, {
    projectsPath: options.projectsPath ?? env.GITBOOK_PROJECTS_PATH,
  });
};
