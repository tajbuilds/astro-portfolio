import type {
  GitBookPage,
  GitBookPageTreeNode,
  PortfolioDocumentPage,
  PortfolioNavigationNode,
  PortfolioProject,
  PortfolioProjectSummary,
} from './types.ts';

export const normalizeGitBookPath = (value: string | null | undefined) =>
  (value ?? '').trim().replace(/^\/+|\/+$/g, '');

export const joinGitBookPath = (...parts: Array<string | null | undefined>) =>
  parts.map(normalizeGitBookPath).filter(Boolean).join('/');

export const SHOWCASE_PROJECT_TAG = 'showcase';

const normalizeTagLabel = (tag: unknown): string => {
  if (typeof tag === 'string') return tag.trim();
  if (!tag || typeof tag !== 'object') return '';

  const value = tag as Record<string, unknown>;

  if ('tag' in value) {
    const nestedTag = value.tag;
    if (typeof nestedTag === 'string') return nestedTag.trim();
    if (nestedTag && typeof nestedTag === 'object') {
      const nestedValue = nestedTag as Record<string, unknown>;
      if (typeof nestedValue.tag === 'string') return nestedValue.tag.trim();
    }
  }

  for (const key of ['name', 'title', 'label', 'slug']) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  return '';
};

export const normalizeProjectTagKey = (tag: string) =>
  tag.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const PROJECT_TAG_INITIALISMS = new Set([
  'ai',
  'api',
  'cdn',
  'ci',
  'cms',
  'css',
  'd1',
  'html',
  'http',
  'https',
  'js',
  'json',
  'ml',
  'r2',
  'seo',
  'sql',
  'ssr',
  'ts',
  'ui',
  'ux',
]);

export const formatProjectTagLabel = (tag: string) =>
  normalizeProjectTagKey(tag)
    .split('-')
    .filter(Boolean)
    .map((part) =>
      PROJECT_TAG_INITIALISMS.has(part)
        ? part.toUpperCase()
        : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
    )
    .join(' ');

export const normalizeGitBookProjectTags = (tags: unknown[] | null | undefined) => {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawTag of tags ?? []) {
    const label = normalizeTagLabel(rawTag);
    const key = normalizeProjectTagKey(label);
    if (!label || !key || seen.has(key)) continue;

    seen.add(key);
    normalized.push(label);
  }

  return normalized;
};

export const isReservedProjectTag = (tag: string) =>
  normalizeProjectTagKey(tag) === SHOWCASE_PROJECT_TAG;

export const normalizeGitBookMarkdown = (
  markdown: string | null | undefined,
  pageTitle?: string | null,
) => {
  let content = (markdown ?? '').replace(/^\uFEFF/, '');

  if (content.startsWith('---')) {
    content = content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
  }

  content = content.replace(/^\s+/, '');

  const title = pageTitle?.trim();
  if (title) {
    const lines = content.split(/\r?\n/);
    const firstLine = lines[0]?.trim() ?? '';
    if (firstLine.toLocaleLowerCase() === `# ${title}`.toLocaleLowerCase()) {
      lines.shift();
      while (lines[0]?.trim() === '') lines.shift();
      content = lines.join('\n');
    }
  }

  return content.trimEnd();
};

export const findPageByPath = (
  pages: GitBookPageTreeNode[],
  targetPath: string,
): GitBookPageTreeNode | null => {
  const normalizedTarget = normalizeGitBookPath(targetPath);

  for (const page of pages) {
    if (normalizeGitBookPath(page.path) === normalizedTarget) return page;
    const nested = findPageByPath(page.pages ?? [], normalizedTarget);
    if (nested) return nested;
  }

  return null;
};

export const countDescendants = (pages: GitBookPageTreeNode[]): number =>
  pages.reduce((total, page) => total + 1 + countDescendants(page.pages ?? []), 0);

export const mapNavigationNode = (
  page: GitBookPageTreeNode,
  projectPath: string,
): PortfolioNavigationNode => {
  const normalizedProjectPath = normalizeGitBookPath(projectPath);
  const normalizedPagePath = normalizeGitBookPath(page.path);
  const relativePath =
    normalizedPagePath === normalizedProjectPath
      ? ''
      : normalizedPagePath.startsWith(`${normalizedProjectPath}/`)
        ? normalizedPagePath.slice(normalizedProjectPath.length + 1)
        : normalizedPagePath;

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    path: normalizedPagePath,
    relativePath,
    description: page.description?.trim() ?? '',
    ...(page.icon ? { icon: page.icon } : {}),
    children: (page.pages ?? []).map((child) => mapNavigationNode(child, projectPath)),
  };
};

export const mapProjectSummary = (
  page: GitBookPageTreeNode,
  order: number,
): PortfolioProjectSummary => {
  const allTags = normalizeGitBookProjectTags(page.tags);

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    path: normalizeGitBookPath(page.path),
    description: page.description?.trim() ?? '',
    ...(page.icon ? { icon: page.icon } : {}),
    order,
    sectionCount: countDescendants(page.pages ?? []),
    tags: allTags.filter((tag) => !isReservedProjectTag(tag)),
    showcase: allTags.some((tag) => isReservedProjectTag(tag)),
  };
};

export const mapProject = (
  treePage: GitBookPageTreeNode,
  detailPage: GitBookPage,
  order: number,
): PortfolioProject => ({
  ...mapProjectSummary(treePage, order),
  markdown: normalizeGitBookMarkdown(detailPage.markdown, detailPage.title),
  navigation: (treePage.pages ?? []).map((page) => mapNavigationNode(page, treePage.path)),
});

export const mapDocumentPage = (
  page: GitBookPage,
  projectPath: string,
): PortfolioDocumentPage => {
  const nav = mapNavigationNode(page, projectPath);
  return {
    id: nav.id,
    title: nav.title,
    slug: nav.slug,
    path: nav.path,
    relativePath: nav.relativePath,
    description: nav.description,
    ...(nav.icon ? { icon: nav.icon } : {}),
    markdown: normalizeGitBookMarkdown(page.markdown, page.title),
    children: nav.children,
  };
};
