/**
 * Render assets/icon.svg to the PNG sizes the Chrome Web Store and the browser
 * chrome expect, into public/icons/.
 *
 * Uses the globally installed Playwright rather than adding an image dependency
 * to the extension: this runs by hand when the artwork changes, not on build.
 *
 *   node scripts/make-icons.mjs
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const OUT_DIR = join(root, "public", "icons");
const SIZES = [16, 32, 48, 128];

const globalRoot = execSync("npm root -g").toString().trim();
// Playwright ships CommonJS, and ESM cannot import a directory, so pull it
// in through createRequire rather than a dynamic import.
const { chromium } = createRequire(import.meta.url)(
	join(globalRoot, "playwright"),
);

const svg = readFileSync(join(root, "assets", "icon.svg"), "utf8");

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
for (const size of SIZES) {
	const page = await browser.newPage({
		viewport: { width: size, height: size },
		deviceScaleFactor: 1,
	});
	// A transparent page so the icon's own rounded corners stay rounded.
	await page.setContent(
		`<!doctype html><meta charset="utf-8">
		 <style>html,body{margin:0;padding:0;background:transparent}
		 svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
	);
	const buffer = await page.screenshot({ omitBackground: true });
	writeFileSync(join(OUT_DIR, `icon-${size}.png`), buffer);
	console.log(`  icon-${size}.png`);
	await page.close();
}
await browser.close();
console.log(`書き出し先: ${OUT_DIR}`);
