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

/**
 * One CSS block per switch. Selector lists are deliberately a bit wide: YouTube
 * renames custom elements over time, and an extra selector that matches nothing
 * costs nothing.
 */
const RULES: Record<keyof Settings, string> = {
	// Handled by the service worker, not by CSS.
	redirectShorts: "",

	hideSidebarLink: `
		ytd-guide-entry-renderer:has(a[href^="/shorts"]),
		ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]) { display: none !important; }
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
	let style = document.getElementById(STYLE_ELEMENT_ID);
	if (!style) {
		style = document.createElement("style");
		style.id = STYLE_ELEMENT_ID;
		// documentElement, not head: the content script can run before <head>
		// exists, and appending to the root works either way.
		document.documentElement.appendChild(style);
	}
	style.textContent = buildCss(settings);
}

loadSettings().then(applySettings);

// Re-apply when the popup toggles something, so the page updates without a reload.
chrome.storage.onChanged.addListener((_changes, area) => {
	if (area !== "sync") return;
	loadSettings().then(applySettings);
});
