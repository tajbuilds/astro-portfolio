import { GitBookApiError } from './client.ts';
import type {
  GitBookCacheStore,
  GitBookClient,
  GitBookPage,
  GitBookPagesResponse,
} from './types.ts';

const CACHE_SCHEMA_VERSION = 'v1';

export const GITBOOK_TREE_FRESH_TTL_SECONDS = 60 * 60;
export const GITBOOK_PAGE_FRESH_TTL_SECONDS = 6 * 60 * 60;
export const GITBOOK_CACHE_RETENTION_SECONDS = 7 * 24 * 60 * 60;

type CacheEnvelope<T> = {
  cachedAt: number;
  value: T;
};

type CacheLogger = Pick<Console, 'debug' | 'warn'>;

export type GitBookCacheOptions = {
  treeFreshTtlSeconds?: number;
  pageFreshTtlSeconds?: number;
  retentionSeconds?: number;
  now?: () => number;
  logger?: CacheLogger;
};

const safeParseEnvelope = <T>(raw: string | null): CacheEnvelope<T> | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CacheEnvelope<T>>;
    if (
      typeof parsed.cachedAt !== 'number' ||
      !Number.isFinite(parsed.cachedAt) ||
      !('value' in parsed)
    ) {
      return null;
    }

    return parsed as CacheEnvelope<T>;
  } catch {
    return null;
  }
};

const canServeStale = (error: unknown) => {
  if (!(error instanceof GitBookApiError)) return true;
  return error.status === 408 || error.status === 429 || error.status >= 500;
};

const makeCacheKey = (spaceId: string, suffix: string) =>
  `gitbook-cache:${CACHE_SCHEMA_VERSION}:${spaceId}:${suffix}`;

export const createCachedGitBookClient = (
  client: GitBookClient,
  cache: GitBookCacheStore | undefined,
  options: GitBookCacheOptions = {},
): GitBookClient => {
  if (!cache) return client;

  const treeFreshTtlSeconds =
    options.treeFreshTtlSeconds ?? GITBOOK_TREE_FRESH_TTL_SECONDS;
  const pageFreshTtlSeconds =
    options.pageFreshTtlSeconds ?? GITBOOK_PAGE_FRESH_TTL_SECONDS;
  const retentionSeconds = options.retentionSeconds ?? GITBOOK_CACHE_RETENTION_SECONDS;
  const now = options.now ?? Date.now;
  const logger = options.logger ?? console;

  const requestWithCache = async <T>(
    key: string,
    label: string,
    freshTtlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> => {
    let cached: CacheEnvelope<T> | null = null;

    try {
      cached = safeParseEnvelope<T>(await cache.get(key));
    } catch (error) {
      logger.warn(`[gitbook-cache] READ_ERROR ${label}`, error);
    }

    if (cached && now() - cached.cachedAt <= freshTtlSeconds * 1000) {
      logger.debug(`[gitbook-cache] HIT ${label}`);
      return cached.value;
    }

    try {
      const value = await load();
      const envelope: CacheEnvelope<T> = {
        cachedAt: now(),
        value,
      };

      try {
        await cache.put(key, JSON.stringify(envelope), {
          expirationTtl: retentionSeconds,
        });
      } catch (error) {
        logger.warn(`[gitbook-cache] WRITE_ERROR ${label}`, error);
      }

      logger.debug(`[gitbook-cache] ${cached ? 'REFRESH' : 'MISS'} ${label}`);
      return value;
    } catch (error) {
      if (cached && canServeStale(error)) {
        logger.warn(`[gitbook-cache] STALE ${label}`, error);
        return cached.value;
      }

      throw error;
    }
  };

  return {
    spaceId: client.spaceId,
    listPages: () =>
      requestWithCache<GitBookPagesResponse>(
        makeCacheKey(client.spaceId, 'pages'),
        'pages',
        treeFreshTtlSeconds,
        () => client.listPages(),
      ),
    getPageById: (pageId: string) =>
      requestWithCache<GitBookPage>(
        makeCacheKey(client.spaceId, `page:${pageId}`),
        'page',
        pageFreshTtlSeconds,
        () => client.getPageById(pageId),
      ),
  };
};
