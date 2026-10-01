import test from 'node:test';
import assert from 'node:assert/strict';

import { createGitBookClient } from '../../src/lib/gitbook/client.ts';
import {
  findPageByPath,
  formatProjectTagLabel,
  mapProjectSummary,
  normalizeGitBookMarkdown,
  normalizeGitBookProjectTags,
  normalizeGitBookPath,
} from '../../src/lib/gitbook/mapper.ts';
import { createGitBookPortfolio } from '../../src/lib/gitbook/index.ts';

const fixtureTree = {
  pages: [
    {
      id: 'projects-root',
      title: 'Projects',
      slug: 'projects',
      path: 'projects',
      pages: [
        {
          id: 'project-1',
          title: 'Edge Cache & API Proxy',
          slug: 'edge-cache-api-proxy',
          path: 'projects/edge-cache-api-proxy',
          description: 'Architecture case study.',
          tags: [
            { tag: { kind: 'tag', tag: 'showcase' } },
            { tag: { kind: 'tag', tag: 'cloudflare' } },
            { tag: { kind: 'tag', tag: 'edge-architecture' } },
            { tag: { kind: 'tag', tag: 'caching' } },
            { tag: { kind: 'tag', tag: 'api-architecture' } },
            'cloudflare',
          ],
          pages: [
            {
              id: 'page-1',
              title: 'Target Architecture',
              slug: 'target-architecture',
              path: 'projects/edge-cache-api-proxy/target-architecture',
              description: 'Target state.',
              pages: [],
            },
          ],
        },
        {
          id: 'project-2',
          title: 'Jet2 Integration',
          slug: 'jet2-integration',
          path: 'projects/jet2-integration',
          description: 'Integration case study.',
          tags: [
            { tag: { kind: 'tag', tag: 'integration' } },
            { tag: { kind: 'tag', tag: 'api-architecture' } },
          ],
          pages: [],
        },
      ],
    },
  ],
};

test('normalizes GitBook paths', () => {
  assert.equal(normalizeGitBookPath('/projects/example/'), 'projects/example');
});

test('finds nested pages and maps project order from hierarchy', () => {
  const project = findPageByPath(fixtureTree.pages, 'projects/edge-cache-api-proxy');
  assert.ok(project);
  const summary = mapProjectSummary(project, 0);
  assert.equal(summary.slug, 'edge-cache-api-proxy');
  assert.equal(summary.order, 0);
  assert.equal(summary.sectionCount, 1);
});

test('maps project tags and keeps showcase as reserved metadata', () => {
  const project = findPageByPath(fixtureTree.pages, 'projects/edge-cache-api-proxy');
  assert.ok(project);

  const summary = mapProjectSummary(project, 0);
  assert.equal(summary.showcase, true);
  assert.deepEqual(summary.tags, [
    'cloudflare',
    'edge-architecture',
    'caching',
    'api-architecture',
  ]);
});

test('normalizes live GitBook page tags without duplicates', () => {
  assert.deepEqual(
    normalizeGitBookProjectTags([
      { tag: { kind: 'tag', tag: 'cloudflare' } },
      { tag: { kind: 'tag', tag: 'Cloudflare' } },
      { tag: { kind: 'tag', tag: 'edge-architecture' } },
      null,
    ]),
    ['cloudflare', 'edge-architecture'],
  );
});

test('normalizes GitBook frontmatter and duplicate page heading', () => {
  const markdown = [
    '---',
    'description: Target state.',
    '---',
    '',
    '# Target Architecture',
    '',
    '## Design',
    '',
    'Body.',
  ].join('\n');

  assert.equal(
    normalizeGitBookMarkdown(markdown, 'Target Architecture'),
    ['## Design', '', 'Body.'].join('\n'),
  );
});

test('formats canonical project tag keys for presentation', () => {
  assert.equal(formatProjectTagLabel('cloudflare'), 'Cloudflare');
  assert.equal(formatProjectTagLabel('edge-architecture'), 'Edge Architecture');
  assert.equal(formatProjectTagLabel('api-architecture'), 'API Architecture');
});

test('GitBook client keeps credentials server-side and requests Markdown', async () => {
  let seenUrl = '';
  let seenAuth = '';

  const fetchImpl = async (input, init) => {
    seenUrl = String(input);
    seenAuth = new Headers(init?.headers).get('authorization') ?? '';
    return new Response(JSON.stringify({
      id: 'page-1',
      title: 'Target Architecture',
      slug: 'target-architecture',
      path: 'projects/edge-cache-api-proxy/target-architecture',
      pages: [],
      markdown: '# Target Architecture',
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const client = createGitBookClient({
    token: 'secret-token',
    spaceId: 'space-id',
    apiBaseUrl: 'https://api.example.test/v1',
    fetchImpl,
  });

  const page = await client.getPageById('page-1');
  assert.equal(page.markdown, '# Target Architecture');
  assert.equal(seenAuth, 'Bearer secret-token');
  assert.match(seenUrl, /\/content\/page\/page-1/);
  assert.match(seenUrl, /format=markdown/);
  assert.match(seenUrl, /metadata=true/);
});

test('portfolio discovers only direct children of Projects and reads project/page Markdown', async () => {
  let listPagesCalls = 0;
  const client = {
    spaceId: 'space-id',
    async listPages() {
      listPagesCalls += 1;
      return fixtureTree;
    },
    async getPageById(pageId) {
      const findById = (pages) => {
        for (const page of pages) {
          if (page.id === pageId) return page;
          const nested = findById(page.pages ?? []);
          if (nested) return nested;
        }
        return null;
      };
      const page = findById(fixtureTree.pages);
      if (!page) throw new Error(`missing fixture page: ${pageId}`);
      return {
        ...page,
        markdown: ['---', `description: ${page.description ?? ''}`, '---', '', `# ${page.title}`, '', '## Body'].join('\n'),
      };
    },
  };

  const portfolio = createGitBookPortfolio(client);
  const projects = await portfolio.getProjects();
  assert.deepEqual(
    projects.map((project) => project.slug),
    ['edge-cache-api-proxy', 'jet2-integration'],
  );

  const showcase = await portfolio.getShowcaseProjects(2);
  assert.deepEqual(showcase.map((project) => project.slug), ['edge-cache-api-proxy']);

  assert.deepEqual(await portfolio.getProjectTags(), [
    'api-architecture',
    'caching',
    'cloudflare',
    'edge-architecture',
    'integration',
  ]);

  const edgeProjects = await portfolio.getProjectsByTag('edge-architecture');
  assert.deepEqual(edgeProjects.map((project) => project.slug), ['edge-cache-api-proxy']);

  const integrationProjects = await portfolio.getProjectsByTag('integration');
  assert.deepEqual(integrationProjects.map((project) => project.slug), ['jet2-integration']);

  const project = await portfolio.getProject('edge-cache-api-proxy');
  assert.equal(project?.markdown, '## Body');
  assert.equal(project?.navigation[0]?.relativePath, 'target-architecture');

  const page = await portfolio.getPage('edge-cache-api-proxy', 'target-architecture');
  assert.equal(page?.relativePath, 'target-architecture');
  assert.equal(page?.markdown, '## Body');

  const missing = await portfolio.getPage('edge-cache-api-proxy', 'does-not-exist');
  assert.equal(missing, null);
  assert.equal(listPagesCalls, 1);
});
