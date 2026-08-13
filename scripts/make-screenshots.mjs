/**
 * Produce Chrome Web Store screenshots (1280x800) into assets/store/.
 *
 *   node scripts/make-screenshots.mjs
 *
 * Run `npm run build` first — this shoots the built popup, not the source, so
 * what the listing shows is what the extension actually renders.
 *
 * ⚠ The YouTube shots contain real thumbnails and channel names. Look at them
 * before uploading; swap the search term if anything in frame is unwanted.
 */
import { execSync } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const DIST = join(root, "dist");
const OUT = join(root, "assets", "store");
const SEARCH = "https://www.youtube.com/results?search_query=lofi";

const W = 1280;
const H = 800;

const globalRoot = execSync("npm root -g").toString().trim();
// Playwright ships CommonJS, and ESM cannot import a directory, so pull it
// in through createRequire rather than a dynamic import.
const { chromium } = createRequire(import.meta.url)(
	join(globalRoot, "playwright"),
);

if (!existsSync(join(DIST, "manifest.json"))) {
	console.error("dist が無い。先に npm run build を実行すること");
	process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const TYPES = {
	".html": "text/html",
	".js": "text/javascript",
	".css": "text/css",
	".png": "image/png",
	".json": "application/json",
};

/** Serve dist/ so the popup's module scripts load under a real origin. */
const server = createServer((req, res) => {
	const file = join(DIST, decodeURIComponent((req.url ?? "/").split("?")[0]));
	const target =
		existsSync(file) && statSync(file).isDirectory()
			? join(file, "index.html")
			: file;
	if (!existsSync(target)) {
		res.writeHead(404).end();
		return;
	}
	res.writeHead(200, {
		"content-type": TYPES[extname(target)] ?? "application/octet-stream",
	});
	createReadStream(target).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();

// --- 1. The popup, centred on a plain canvas ------------------------------
{
	const page = await browser.newPage({ viewport: { width: W, height: H } });
	// The popup talks to chrome.storage; outside an extension there is none, so
	// stand in for it with the defaults the extension itself would fall back to.
	await page.addInitScript(() => {
		const state = {};
		window.chrome = {
			storage: {
				sync: {
					get: async (keys) => {
						const out = {};
						for (const k of Array.isArray(keys)
							? keys
							: Object.keys(keys ?? {})) {
							out[k] = state[k] ?? true;
						}
						return out;
					},
					set: async (items) => Object.assign(state, items),
				},
				onChanged: { addListener: () => {} },
			},
		};
	});
	await page.goto(`http://localhost:${port}/index.html`);
	await page.waitForTimeout(700);
	const popup = await page.locator("#app").screenshot();
	const dataUrl = `data:image/png;base64,${popup.toString("base64")}`;

	const canvas = await browser.newPage({ viewport: { width: W, height: H } });
	await canvas.setContent(`<!doctype html><meta charset="utf-8">
		<style>
			html,body{margin:0;height:100%;font-family:system-ui,"Noto Sans JP",sans-serif}
			body{display:flex;flex-direction:column;align-items:center;justify-content:center;
			     gap:28px;background:linear-gradient(160deg,#1b1b1b,#3a1010)}
			h1{margin:0;color:#fff;font-size:34px;letter-spacing:.02em}
			p{margin:0;color:#d8d8d8;font-size:17px}
			img{border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.55)}
		</style>
		<h1>項目ごとにオンオフ</h1>
		<p>隠す場所も、リダイレクトも、必要なものだけ選べます</p>
		<img src="${dataUrl}">`);
	await canvas.waitForTimeout(400);
	await canvas.screenshot({ path: join(OUT, "01-popup.png") });
	console.log("  01-popup.png");
	await page.close();
	await canvas.close();
}

// --- 2 & 3. YouTube with and without the extension ------------------------
for (const [name, load] of [
	["02-youtube-with-extension.png", true],
	["03-youtube-without-extension.png", false],
]) {
	const ctx = await chromium.launchPersistentContext("", {
		headless: false,
		args: load
			? [
					`--disable-extensions-except=${DIST}`,
					`--load-extension=${DIST}`,
				]
			: [],
		viewport: { width: W, height: H },
		locale: "ja-JP",
	});
	const page = ctx.pages()[0] ?? (await ctx.newPage());
	await page
		.goto(SEARCH, { waitUntil: "commit", timeout: 30000 })
		.catch(() => {});
	await page.waitForTimeout(9000);
	await page.click("#guide-button button", { timeout: 5000 }).catch(() => {});
	await page.waitForTimeout(3000);
	await page.screenshot({ path: join(OUT, name) });
	console.log(`  ${name}`);
	await ctx.close().catch(() => {});
}

await browser.close();
server.close();
console.log(`書き出し先: ${OUT}`);
