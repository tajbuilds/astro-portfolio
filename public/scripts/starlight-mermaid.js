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
		container.className = "mermaid";
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
				? cssVar("--color-surface", "#172238")
				: cssVar("--color-bg-elevated", "#ffffff"),
			primaryTextColor: cssVar("--color-text", isDark ? "#e8eefc" : "#111827"),
			primaryBorderColor: cssVar("--color-border", "#d1d5db"),
			secondaryColor: isDark
				? cssVar("--color-bg-elevated", "#121a2b")
				: cssVar("--color-surface", "#f3f4f6"),
			secondaryTextColor: cssVar("--color-text", isDark ? "#e8eefc" : "#111827"),
			secondaryBorderColor: cssVar("--color-border", "#d1d5db"),
			lineColor: isDark
				? cssVar("--color-accent", "#60a5fa")
				: cssVar("--color-border", "#9ca3af"),
			textColor: cssVar("--color-text", isDark ? "#e8eefc" : "#111827"),
			tertiaryColor: cssVar("--color-bg", isDark ? "#0b1220" : "#f8fafc"),
			tertiaryTextColor: cssVar("--color-text", isDark ? "#e8eefc" : "#111827"),
			tertiaryBorderColor: cssVar("--color-border", "#d1d5db"),
			clusterBkg: isDark
				? cssVar("--color-bg-elevated", "#121a2b")
				: cssVar("--color-bg-elevated", "#ffffff"),
			clusterBorder: cssVar("--color-border", "#d1d5db"),
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
