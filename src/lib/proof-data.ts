export interface ProofItem {
	label: string;
	copy: string;
}

export const homepageProofItems: ProofItem[] = [
	{
		label: 'Verification flow',
		copy: 'Reduced abuse by moving trust checks and forwarding control to the edge.',
	},
	{
		label: 'Discovery systems',
		copy: 'Moved discovery filtering to a server-side contract with clearer query control.',
	},
	{
		label: 'Caching behavior',
		copy: 'Improved cache predictability through deterministic edge controls.',
	},
	{
		label: 'Platform delivery',
		copy: 'Modernized internal tooling into modular, reproducible delivery paths.',
	},
];

const workProofMap: Record<string, ProofItem[]> = {
	'smart-edge-cache-proxy': [
		{
			label: 'What changed',
			copy: 'Equivalent requests now resolve to deterministic cache keys instead of fragmenting across noisy query variants.',
		},
		{
			label: 'Operational gain',
			copy: 'Cache behavior can be changed through KV policy without relying on redeploys for each routing adjustment.',
		},
		{
			label: 'Reliability',
			copy: 'Invalidation moved toward versioned logical refresh rather than relying on less predictable physical deletes.',
		},
	],
	'webflow-turnstile-edge-worker-pipeline': [
		{
			label: 'What changed',
			copy: 'Only verified and authentic submissions reach downstream workflows instead of allowing noisy public intake paths.',
		},
		{
			label: 'Operational gain',
			copy: 'Routing logic became deterministic across forms and domains rather than drifting through scattered controls.',
		},
		{
			label: 'Visibility',
			copy: 'Blocked and allowed paths now produce usable telemetry for troubleshooting and review.',
		},
	],
	'faceted-deals-search-engine': [
		{
			label: 'What changed',
			copy: 'Filtering moved from browser-side complexity into a structured server-side search architecture.',
		},
		{
			label: 'Operational gain',
			copy: 'The query contract became clearer, reducing frontend branching and future backend coupling.',
		},
		{
			label: 'Scalability',
			copy: 'Discovery now holds up against large changing datasets without leaning on fragile client-side filtering.',
		},
	],
	'internal-ml-workbench-modernization': [
		{
			label: 'What changed',
			copy: 'A stale monolithic ML tool became a modular internal workbench with clearer boundaries and reproducible runtime behavior.',
		},
		{
			label: 'Operational gain',
			copy: 'Containerized delivery and CI-backed publishing reduced setup friction and deployment guesswork for internal users.',
		},
		{
			label: 'Maintainability',
			copy: 'Explicit pipelines and modular structure made the system easier to inspect, evolve, and hand over.',
		},
	],
};

export const workOverviewProofItems: ProofItem[] = [
	{
		label: 'Edge control',
		copy: 'Verification, routing, and intake systems designed to reduce abuse and increase trust at the entry layer.',
	},
	{
		label: 'Search and retrieval',
		copy: 'Discovery architecture designed for structured queries, scalable filters, and clearer backend contracts.',
	},
	{
		label: 'Operational clarity',
		copy: 'Systems shaped to improve maintainability, observability, and delivery confidence rather than just shipping features.',
	},
];

export const getWorkProofItems = (slug: string) => workProofMap[slug] ?? [];
