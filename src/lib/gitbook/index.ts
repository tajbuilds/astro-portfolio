import { createGitBookClientFromEnv } from './client.ts';
import { getPortfolioPage, getPortfolioProjectPages } from './pages.ts';
import {
  getPortfolioProject,
  listPortfolioProjects,
  listPortfolioProjectsByTag,
  listPortfolioProjectTags,
  listShowcasePortfolioProjects,
} from './projects.ts';
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
  listPortfolioProjectsByTag,
  listPortfolioProjectTags,
  listShowcasePortfolioProjects,
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
  formatProjectTagLabel,
  normalizeGitBookProjectTags,
  normalizeProjectTagKey,
  isReservedProjectTag,
  SHOWCASE_PROJECT_TAG,
} from './mapper.ts';
export type * from './types.ts';

export const createGitBookPortfolio = (
  client: GitBookClient,
  options: GitBookPortfolioOptions = {},
): GitBookPortfolio => {
  let pageTreeRequest: ReturnType<GitBookClient['listPages']> | null = null;

  const requestClient: GitBookClient = {
    spaceId: client.spaceId,
    listPages: () => {
      pageTreeRequest ??= client.listPages();
      return pageTreeRequest;
    },
    getPageById: (pageId) => client.getPageById(pageId),
  };

  return {
    getProjects: () => listPortfolioProjects(requestClient, options),
    getShowcaseProjects: (limit) => listShowcasePortfolioProjects(requestClient, limit, options),
    getProjectTags: () => listPortfolioProjectTags(requestClient, options),
    getProjectsByTag: (tag) => listPortfolioProjectsByTag(requestClient, tag, options),
    getProject: (projectSlug) => getPortfolioProject(requestClient, projectSlug, options),
    getProjectPages: (projectSlug) => getPortfolioProjectPages(requestClient, projectSlug, options),
    getPage: (projectSlug, pagePath) =>
      getPortfolioPage(requestClient, projectSlug, pagePath, options),
  };
};

export const createGitBookPortfolioFromEnv = (
  env: GitBookRuntimeEnv,
  options: GitBookPortfolioOptions = {},
) => {
  const client = createGitBookClientFromEnv(env);
  return createGitBookPortfolio(client, {
    projectsPath: options.projectsPath ?? env.GITBOOK_PROJECTS_PATH,
  });
};
