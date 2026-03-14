import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

let initialized = false;

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
		container.textContent = normalizeMermaidSource(getMermaidSource(pre, block));
		pre.dataset.mermaidConverted = "true";
		pre.replaceWith(container);
	}
}

async function renderMermaid() {
	if (!initialized) {
		mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "default" });
		initialized = true;
	}

	convertMermaidBlocks();
	await mermaid.run({ querySelector: ".mermaid" });
}

const scheduleRender = () => {
	requestAnimationFrame(() => {
		renderMermaid().catch((error) => {
			console.error("Mermaid render failed", error);
		});
	});
};

document.addEventListener("DOMContentLoaded", scheduleRender);
document.addEventListener("astro:page-load", scheduleRender);
