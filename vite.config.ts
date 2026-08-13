import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";

const manifest = defineManifest({
	manifest_version: 3,
	name: "NoYouTubeShorts",
	version: "0.1.0",
	description:
		"YouTube の Shorts への導線を隠し、Shorts を開いたら通常の YouTube へ戻す",
	// Only `storage`, for the per-feature switches. The redirect used to need
	// `tabs` so a service worker could read the active tab's URL, but that also
	// missed every in-site navigation (YouTube is a single-page app) and showed
	// users a "read your browsing history" warning. Doing it in the content
	// script fixes both.
	permissions: ["storage"],
	// Rendered from assets/icon.svg by scripts/make-icons.mjs. 128 is what the
	// store listing shows; the smaller sizes are for the toolbar and the
	// extensions page.
	icons: {
		16: "icons/icon-16.png",
		32: "icons/icon-32.png",
		48: "icons/icon-48.png",
		128: "icons/icon-128.png",
	},
	action: {
		default_popup: "index.html",
		default_title: "NoYouTubeShorts",
		default_icon: {
			16: "icons/icon-16.png",
			32: "icons/icon-32.png",
			48: "icons/icon-48.png",
			128: "icons/icon-128.png",
		},
	},
	content_scripts: [
		{
			js: ["src/content.ts"],
			matches: ["https://www.youtube.com/*", "https://m.youtube.com/*"],
			// The style has to be in place before the first paint, otherwise the
			// Shorts shelf flashes into view and then disappears.
			run_at: "document_start",
		},
	],
});

// biome-ignore lint/style/noDefaultExport: Vite requires the config as a default export
export default defineConfig({
	plugins: [crx({ manifest })],
});
