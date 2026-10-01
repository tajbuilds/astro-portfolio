export type GitBookPageTreeNode = {
  id: string;
  title: string;
  description?: string | null;
  path: string;
  slug: string;
  icon?: string | null;
  kind?: string;
  type?: string;
  pages?: GitBookPageTreeNode[];
  tags?: unknown[];
};

export type GitBookPage = GitBookPageTreeNode & {
  markdown?: string;
};

export type GitBookPagesResponse = {
  pages: GitBookPageTreeNode[];
};

export type GitBookRuntimeEnv = {
  GITBOOK_TOKEN?: string;
  GITBOOK_SPACE_ID?: string;
  GITBOOK_PROJECTS_PATH?: string;
};

export type GitBookClientOptions = {
  token: string;
  spaceId: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type GitBookClient = {
  readonly spaceId: string;
  listPages(): Promise<GitBookPagesResponse>;
  getPageByPath(pagePath: string): Promise<GitBookPage>;
};

export type PortfolioNavigationNode = {
  id: string;
  title: string;
  slug: string;
  path: string;
  relativePath: string;
  description: string;
  icon?: string;
  children: PortfolioNavigationNode[];
};

export type PortfolioProjectSummary = {
  id: string;
  title: string;
  slug: string;
  path: string;
  description: string;
  icon?: string;
  order: number;
  sectionCount: number;
};

export type PortfolioProject = PortfolioProjectSummary & {
  markdown: string;
  navigation: PortfolioNavigationNode[];
};

export type PortfolioDocumentPage = {
  id: string;
  title: string;
  slug: string;
  path: string;
  relativePath: string;
  description: string;
  icon?: string;
  markdown: string;
  children: PortfolioNavigationNode[];
};

export type GitBookPortfolioOptions = {
  projectsPath?: string;
};

export type GitBookPortfolio = {
  getProjects(): Promise<PortfolioProjectSummary[]>;
  getProject(projectSlug: string): Promise<PortfolioProject | null>;
  getProjectPages(projectSlug: string): Promise<PortfolioNavigationNode[] | null>;
  getPage(projectSlug: string, pagePath?: string): Promise<PortfolioDocumentPage | null>;
};
