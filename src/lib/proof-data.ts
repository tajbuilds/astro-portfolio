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

