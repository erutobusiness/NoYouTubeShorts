import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-svelte"],
  manifest: {
    name: "No YouTube Shorts",
    description: "Don't Watch YouTube Shorts!",
    version: "1.0.0",
    permissions: ["storage", "tabs"],
    host_permissions: ["*://www.youtube.com/*", "*://m.youtube.com/*"],
    icons: {
      "16": "icon-16.png",
      "32": "icon-32.png",
      "48": "icon-48.png",
      "128": "icon-128.png",
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
