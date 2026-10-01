import type {
  GitBookClient,
  GitBookClientOptions,
  GitBookPage,
  GitBookPagesResponse,
  GitBookRuntimeEnv,
} from './types.ts';

const DEFAULT_API_BASE_URL = 'https://api.gitbook.com/v1';

const trimSlashes = (value: string) => value.replace(/^\\/+|\\/+$/g, '');

const encodeContentPath = (value: string) =>
  trimSlashes(value)
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

export class GitBookApiError extends Error {
  readonly status: number;
  readonly requestUrl: string;
  readonly responseBody: string;

  constructor(message: string, status: number, requestUrl: string, responseBody: string) {
    super(message);
    this.name = 'GitBookApiError';
    this.status = status;
    this.requestUrl = requestUrl;
    this.responseBody = responseBody;
  }
}

const requireValue = (value: string | undefined, name: string) => {
  const clean = value?.trim();
  if (!clean) throw new Error(`${name} is required for GitBook CMS access.`);
  return clean;
};

export const createGitBookClient = (options: GitBookClientOptions): GitBookClient => {
  const token = requireValue(options.token, 'GITBOOK_TOKEN');
  const spaceId = requireValue(options.spaceId, 'GITBOOK_SPACE_ID');
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiBaseUrl = (options.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\\/+$/g, '');

  const request = async <T>(pathname: string, searchParams?: URLSearchParams): Promise<T> => {
    const url = new URL(`${apiBaseUrl}${pathname}`);
    if (searchParams) url.search = searchParams.toString();

    const response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new GitBookApiError(
        `GitBook API request failed with ${response.status}.`,
        response.status,
        url.toString(),
        body,
      );
    }

    return (await response.json()) as T;
  };

  return {
    spaceId,
    listPages: () => request<GitBookPagesResponse>(`/spaces/${encodeURIComponent(spaceId)}/content/pages`),
    getPageByPath: (pagePath: string) => {
      const encodedPath = encodeContentPath(pagePath);
      if (!encodedPath) throw new Error('GitBook page path cannot be empty.');

      const params = new URLSearchParams({
        format: 'markdown',
        metadata: 'true',
        'format.markdown.refs': 'relative',
      });

      return request<GitBookPage>(
        `/spaces/${encodeURIComponent(spaceId)}/content/path/${encodedPath}`,
        params,
      );
    },
  };
};

export const createGitBookClientFromEnv = (env: GitBookRuntimeEnv) =>
  createGitBookClient({
    token: requireValue(env.GITBOOK_TOKEN, 'GITBOOK_TOKEN'),
    spaceId: requireValue(env.GITBOOK_SPACE_ID, 'GITBOOK_SPACE_ID'),
  });
