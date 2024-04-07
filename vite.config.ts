import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";

const manifest = defineManifest({
	manifest_version: 3,
	name: "NoYouTubeShorts",
	version: "0.0.1",
	description: "Don't Watch YouTubeShorts!",
	permissions: ["tabs"],
	action: {
		// default_icon: "logoVite",
		default_popup: "index.html",
		default_title: "NoYouTubeShorts",
	},
	// content_scripts: [
	// 	{
	// 		js: ["src/main.ts"],
	// 		matches: ["<all_urls>"],
	// 	},
	// ],
	background: {
		service_worker: "src/background.ts",
		type: "module",
	},
});

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
	plugins: [crx({ manifest })],
});
