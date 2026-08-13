/**
 * Hides Shorts entry points on youtube.com.
 *
 * Everything is done by injecting CSS rather than removing nodes: YouTube
 * re-renders constantly, so a MutationObserver that deletes elements fights the
 * app forever, while a stylesheet keeps applying to whatever gets rendered next.
 *
 * Selectors match on `href` starting with `/shorts` instead of visible text,
 * because the interface is translated and text would break outside English.
 */

import { type Settings, loadSettings } from "./settings";

const STYLE_ELEMENT_ID = "no-youtube-shorts-style";

/** Marker this script puts on guide entries it has identified as Shorts. */
const SHORTS_ENTRY_ATTR = "data-nys-shorts-entry";
/** Set on entries already looked at, so the scan never re-examines them. */
const SCANNED_ATTR = "data-nys-scanned";

/**
 * Start of the `d` attribute of the Shorts icon.
 *
 * ⚠ The expanded guide renders its Shorts entry as an `<a>` **with no href**, so
 * matching on the link misses it — only the collapsed mini guide carries
 * `href="/shorts/"`. The visible label is translated, so that is no good either.
 * Measured across all 18 guide entries, the icon path is the only handle that is
 * both language-independent and unique to Shorts. A prefix is used so a small
 * tweak to the tail of the shape does not break the match.
 */
const SHORTS_ICON_PATH_PREFIX = "m13.467 1.19";

/**
 * One CSS block per switch. Selector lists are deliberately a bit wide: YouTube
 * renames custom elements over time, and an extra selector that matches nothing
 * costs nothing.
 */
const RULES: Record<keyof Settings, string> = {
	// Handled by the redirect below, not by CSS.
	redirectShorts: "",

	hideSidebarLink: `
		ytd-guide-entry-renderer:has(a[href^="/shorts"]),
		ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
		[${SHORTS_ENTRY_ATTR}] { display: none !important; }
	`,

	hideHomeShelf: `
		ytd-browse[page-subtype="home"] ytd-rich-shelf-renderer[is-shorts],
		ytd-browse[page-subtype="home"] ytd-reel-shelf-renderer,
		ytd-browse[page-subtype="home"] grid-shelf-view-model,
		ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(a[href^="/shorts/"]),
		ytd-browse[page-subtype="home"] ytm-shorts-lockup-view-model { display: none !important; }
	`,

	hideSearchResults: `
		ytd-search ytd-reel-shelf-renderer,
		ytd-search grid-shelf-view-model,
		ytd-search ytd-video-renderer:has(a[href^="/shorts/"]),
		ytd-search ytm-shorts-lockup-view-model { display: none !important; }
	`,

	hideRelatedAndSubscriptions: `
		ytd-watch-next-secondary-results-renderer ytd-reel-shelf-renderer,
		ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer:has(a[href^="/shorts/"]),
		ytd-browse[page-subtype="subscriptions"] ytd-rich-shelf-renderer[is-shorts],
		ytd-browse[page-subtype="subscriptions"] ytd-reel-shelf-renderer,
		ytd-browse[page-subtype="subscriptions"] ytd-rich-item-renderer:has(a[href^="/shorts/"]),
		ytd-watch-next-secondary-results-renderer ytm-shorts-lockup-view-model,
		ytd-browse[page-subtype="subscriptions"] ytm-shorts-lockup-view-model { display: none !important; }
	`,
};

function buildCss(settings: Settings): string {
	return (Object.keys(RULES) as (keyof Settings)[])
		.filter((key) => settings[key] && RULES[key])
		.map((key) => `/* ${key} */${RULES[key]}`)
		.join("\n");
}

function applySettings(settings: Settings): void {
	// At document_start the root element can still be missing. Wait for it
	// rather than throwing, which would take the redirect down with it.
	const root = document.documentElement;
	if (!root) {
		document.addEventListener(
			"DOMContentLoaded",
			() => applySettings(settings),
			{
				once: true,
			},
		);
		return;
	}
	let style = document.getElementById(STYLE_ELEMENT_ID);
	if (!style) {
		style = document.createElement("style");
		style.id = STYLE_ELEMENT_ID;
		root.appendChild(style);
	}
	style.textContent = buildCss(settings);
}

const REDIRECT_URL = "https://www.youtube.com/";

/** True for a Shorts watch path. `/shortstories` must not match. */
function isShortsPath(pathname: string): boolean {
	return pathname === "/shorts" || pathname.startsWith("/shorts/");
}

/**
 * Set once a redirect has been asked for.
 *
 * ⚠ Without this the extension deadlocks. Calling `location.replace` starts a
 * navigation, which fires the `navigate` event, which called this function
 * again, which restarted the navigation — measured at 6653 restarts in ten
 * seconds, with the URL never leaving the Short.
 */
let redirecting = false;

function redirectIfShorts(settings: Settings): void {
	if (redirecting) return;
	if (!settings.redirectShorts) return;
	if (!isShortsPath(window.location.pathname)) return;
	redirecting = true;
	// `replace`, not `assign`: the Short must not sit in the back history, or
	// pressing Back walks straight into it again.
	window.location.replace(REDIRECT_URL);
}

let current: Settings | undefined;

function apply(settings: Settings): void {
	current = settings;
	// Redirect first. It needs no DOM, and leaving it after the style injection
	// meant any failure there (a missing root at document_start) silently took
	// the redirect with it.
	redirectIfShorts(settings);
	applySettings(settings);
}

loadSettings().then(apply);

// Re-apply when the popup toggles something, so the page updates without a reload.
chrome.storage.onChanged.addListener((_changes, area) => {
	if (area !== "sync") return;
	loadSettings().then(apply);
});

/**
 * Tag guide entries whose icon is the Shorts logo.
 *
 * Tagging is unconditional; whether the tag hides anything is left to the CSS,
 * so flipping the switch off in the popup takes effect without undoing this.
 */
function tagShortsGuideEntries(): void {
	const entries = document.querySelectorAll(
		`ytd-guide-entry-renderer:not([${SCANNED_ATTR}]), ytd-mini-guide-entry-renderer:not([${SCANNED_ATTR}])`,
	);
	for (const entry of entries) {
		const d = entry.querySelector("svg path")?.getAttribute("d");
		// ⚠ Do not mark it scanned yet when there is no icon. The entry element
		// is created before its icon is drawn, and marking it here meant the
		// first look — which sees no path — was also the last one, leaving the
		// expanded guide's Shorts entry permanently untagged and visible.
		if (d === undefined || d === null) continue;
		entry.setAttribute(SCANNED_ATTR, "");
		if (d.startsWith(SHORTS_ICON_PATH_PREFIX)) {
			entry.setAttribute(SHORTS_ENTRY_ATTR, "");
		}
	}
}

/**
 * The guide is built the first time it is opened, so a one-off scan is not
 * enough. This watches for it — narrowly: the query above only ever looks at
 * entries it has not seen, and the callback is coalesced into one run per frame,
 * so this does not turn into a fight with YouTube's re-rendering.
 */
function watchForGuide(): void {
	let queued = false;
	const observer = new MutationObserver(() => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			tagShortsGuideEntries();
		});
	});
	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	tagShortsGuideEntries();
}

if (document.documentElement) {
	watchForGuide();
} else {
	document.addEventListener("DOMContentLoaded", watchForGuide, {
		once: true,
	});
}

// YouTube is a single-page app: opening a Short from inside the site changes the
// URL without reloading the document, so a listener on the extension's service
// worker never sees it. Measured on the live site: `navigation` fires, YouTube's
// own `yt-navigate-finish` fires, `popstate` and a patched `pushState` do not.
// The standard API is the primary hook; YouTube's event is kept as a fallback in
// case the site ships in a browser without it.
function onSoftNavigation(): void {
	if (current) redirectIfShorts(current);
}

if (window.navigation) {
	window.navigation.addEventListener("navigate", () => {
		// The event fires before location updates, so check on the next turn.
		queueMicrotask(onSoftNavigation);
	});
}
document.addEventListener("yt-navigate-finish", onSoftNavigation);
