import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

let initialized = false;
let renderTicket = 0;

function getMermaidSource(pre, code) {
	const lineNodes = code.querySelectorAll(".ec-line .code");
	if (lineNodes.length > 0) {
		const lines = Array.from(lineNodes).map((node) => (node.textContent || "").replace(/\u00a0/g, " "));
		return lines.join("\n");
	}

	// Fallback for non-Expressive-Code renderers.
	return (code.textContent || "").replace(/\u00a0/g, " ");
}

function normalizeMermaidSource(source) {
	return source
		.replace(/\u007f/g, "\n")
		.replace(/<br\s*\/?>/gi, "<br>")
		.trim();
}

function convertMermaidBlocks() {
	const blocks = document.querySelectorAll("pre[data-language='mermaid'] > code, pre > code.language-mermaid");
	for (const block of blocks) {
		const pre = block.closest("pre");
		if (!pre || pre.dataset.mermaidConverted === "true") {
			continue;
		}

		const container = document.createElement("div");
		container.className = "mermaid diagram-mermaid";
		container.dataset.mermaidSource = normalizeMermaidSource(getMermaidSource(pre, block));
		pre.dataset.mermaidConverted = "true";
		pre.replaceWith(container);
	}
}

function cssVar(name, fallback) {
	const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return value || fallback;
}

function currentThemeConfig() {
	const explicitTheme = document.documentElement.dataset.theme;
	const isDark = explicitTheme
		? explicitTheme === "dark"
		: window.matchMedia("(prefers-color-scheme: dark)").matches;

	return {
		startOnLoad: false,
		securityLevel: "loose",
		theme: "base",
		darkMode: isDark,
		themeVariables: {
			background: "transparent",
			primaryColor: isDark
				? cssVar("--diagram-node-bg", "#1a2740")
				: cssVar("--diagram-node-bg", "#ffffff"),
			primaryTextColor: cssVar("--diagram-text", isDark ? "#e8eefc" : "#142033"),
			primaryBorderColor: cssVar("--diagram-node-border", "#c9d6ea"),
			secondaryColor: isDark
				? cssVar("--diagram-cluster-bg", "#122039")
				: cssVar("--diagram-cluster-bg", "#edf3fb"),
			secondaryTextColor: cssVar("--diagram-text", isDark ? "#e8eefc" : "#142033"),
			secondaryBorderColor: cssVar("--diagram-node-border", "#c9d6ea"),
			lineColor: isDark
				? cssVar("--diagram-line", "#7fb4ff")
				: cssVar("--diagram-line", "#5f7ea8"),
			textColor: cssVar("--diagram-text", isDark ? "#e8eefc" : "#142033"),
			tertiaryColor: cssVar("--diagram-bg", isDark ? "#0d1628" : "#f5f8fc"),
			tertiaryTextColor: cssVar("--diagram-text", isDark ? "#e8eefc" : "#142033"),
			tertiaryBorderColor: cssVar("--diagram-node-border", "#c9d6ea"),
			clusterBkg: isDark
				? cssVar("--diagram-cluster-bg", "#122039")
				: cssVar("--diagram-cluster-bg", "#edf3fb"),
			clusterBorder: cssVar("--diagram-node-border", "#c9d6ea"),
		},
	};
}

async function renderMermaidBlocks() {
	const blocks = document.querySelectorAll(".mermaid");
	for (const block of blocks) {
		const source = block.dataset.mermaidSource || block.textContent || "";
		if (!source.trim()) continue;
		const id = `mermaid-${Math.random().toString(36).slice(2)}`;
		try {
			const { svg } = await mermaid.render(id, source);
			block.innerHTML = svg;
		} catch (error) {
			console.error("Mermaid render failed", error);
			block.textContent = source;
		}
	}
}

async function renderMermaid() {
	const currentTicket = ++renderTicket;
	if (!initialized) {
		mermaid.initialize(currentThemeConfig());
		initialized = true;
	} else {
		mermaid.initialize(currentThemeConfig());
	}

	convertMermaidBlocks();
	await renderMermaidBlocks();
	if (currentTicket !== renderTicket) return;
}

const scheduleRender = () => {
	requestAnimationFrame(() => {
		renderMermaid().catch((error) => console.error("Mermaid render failed", error));
	});
};

document.addEventListener("DOMContentLoaded", scheduleRender);
document.addEventListener("astro:page-load", scheduleRender);

const themeObserver = new MutationObserver((changes) => {
	for (const change of changes) {
		if (change.type === "attributes" && change.attributeName === "data-theme") {
			scheduleRender();
			break;
		}
	}
});

themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
