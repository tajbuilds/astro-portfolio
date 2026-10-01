import test from 'node:test';
import assert from 'node:assert/strict';

import { createGitBookClient } from '../../src/lib/gitbook/client.ts';
import {
  findPageByPath,
  mapProjectSummary,
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

  const page = await client.getPageByPath('projects/edge-cache-api-proxy/target-architecture');
  assert.equal(page.markdown, '# Target Architecture');
  assert.equal(seenAuth, 'Bearer secret-token');
  assert.match(seenUrl, /format=markdown/);
  assert.match(seenUrl, /metadata=true/);
});

test('portfolio discovers only direct children of Projects and reads project/page Markdown', async () => {
  const client = {
    spaceId: 'space-id',
    async listPages() {
      return fixtureTree;
    },
    async getPageByPath(path) {
      const page = findPageByPath(fixtureTree.pages, path);
      if (!page) throw new Error(`missing fixture page: ${path}`);
      return { ...page, markdown: `# ${page.title}` };
    },
  };

  const portfolio = createGitBookPortfolio(client);
  const projects = await portfolio.getProjects();
  assert.deepEqual(projects.map((project) => project.slug), ['edge-cache-api-proxy']);

  const project = await portfolio.getProject('edge-cache-api-proxy');
  assert.equal(project?.markdown, '# Edge Cache & API Proxy');
  assert.equal(project?.navigation[0]?.relativePath, 'target-architecture');

  const page = await portfolio.getPage('edge-cache-api-proxy', 'target-architecture');
  assert.equal(page?.relativePath, 'target-architecture');
  assert.equal(page?.markdown, '# Target Architecture');

  const missing = await portfolio.getPage('edge-cache-api-proxy', 'does-not-exist');
  assert.equal(missing, null);
});
