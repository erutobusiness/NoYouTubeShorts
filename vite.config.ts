import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";

const manifest = defineManifest({
	manifest_version: 3,
	name: "NoYouTubeShorts",
	version: "0.1.0",
	description:
		"YouTube の Shorts への導線を隠し、Shorts を開いたら通常の YouTube へ戻す",
	// `storage` holds the per-feature switches; `tabs` is what the redirect needs
	// to see the URL of the active tab.
	permissions: ["tabs", "storage"],
	action: {
		default_popup: "index.html",
		default_title: "NoYouTubeShorts",
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
	background: {
		service_worker: "src/background.ts",
		type: "module",
	},
});

// biome-ignore lint/style/noDefaultExport: Vite requires the config as a default export
export default defineConfig({
	plugins: [crx({ manifest })],
});
