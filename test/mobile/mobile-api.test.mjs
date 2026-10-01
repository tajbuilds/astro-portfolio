import assert from 'node:assert/strict';
import test from 'node:test';

import {
	toWorkDetail,
	toWorkSummary,
} from '../../src/lib/mobile-api.ts';

const project = {
	id: 'project-1',
	title: 'Edge Cache & API Proxy',
	slug: 'edge-cache-api-proxy',
	path: 'projects/edge-cache-api-proxy',
	description: 'Architecture case study.',
	order: 0,
	sectionCount: 2,
	tags: ['cloudflare', 'api-architecture'],
	showcase: true,
	markdown: [
		'## Executive Overview',
		'Overview body.',
		'',
		'## Architecture at a glance',
		'Architecture body.',
		'',
		'## Outcome',
		'Outcome body.',
	].join('\n'),
	navigation: [
		{
			id: 'page-1',
			title: 'Context & Drivers',
			slug: 'context-and-drivers',
			path: 'projects/edge-cache-api-proxy/context-and-drivers',
			relativePath: 'context-and-drivers',
			description: 'Context description.',
			children: [],
		},
		{
			id: 'page-2',
			title: 'Target Architecture',
			slug: 'target-architecture',
			path: 'projects/edge-cache-api-proxy/target-architecture',
			relativePath: 'target-architecture',
			description: 'Target description.',
			children: [],
		},
	],
};

test('maps GitBook project summaries to mobile API v2 shape', () => {
	assert.deepEqual(toWorkSummary(project), {
		slug: 'edge-cache-api-proxy',
		title: 'Edge Cache & API Proxy',
		summary: 'Architecture case study.',
		tags: ['Cloudflare', 'API Architecture'],
		role: 'Solution & Integration Architect',
		timeline: null,
		coverImageUrl: '/images/work-default-cover.svg',
		publishedAt: null,
		updatedAt: null,
		href: '/work/edge-cache-api-proxy/',
	});
});

test('maps GitBook project detail markdown and navigation', () => {
	const detail = toWorkDetail(project);

	assert.equal(detail.content.format, 'markdown');
	assert.equal(detail.sections.context, 'Overview body.');
	assert.equal(detail.sections.approach, 'Architecture body.');
	assert.equal(detail.sections.outcome, 'Outcome body.');
	assert.deepEqual(detail.pages, [
		{
			title: 'Context & Drivers',
			summary: 'Context description.',
			path: 'context-and-drivers',
			href: '/work/edge-cache-api-proxy/context-and-drivers/',
		},
		{
			title: 'Target Architecture',
			summary: 'Target description.',
			path: 'target-architecture',
			href: '/work/edge-cache-api-proxy/target-architecture/',
		},
	]);
	assert.deepEqual(detail.links, {
		liveDemo: null,
		repository: null,
	});
});
