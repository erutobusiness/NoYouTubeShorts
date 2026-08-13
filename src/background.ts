/**
 * Sends Shorts URLs back to the normal YouTube site.
 *
 * Only this redirect lives here; hiding the links that lead to Shorts is done by
 * the content script, which can react to the page without a navigation.
 */

import { loadSettings } from "./settings";

const SHORTS_PATH = "/shorts";
const REDIRECT_URL = "https://www.youtube.com";

/** True for a YouTube Shorts watch URL, false for anything else. */
function isShortsUrl(rawUrl: string): boolean {
	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		return false;
	}
	if (!/(^|\.)youtube\.com$/.test(url.hostname)) return false;
	// Match /shorts and /shorts/<id>, but not a channel named "/shortstories".
	return (
		url.pathname === SHORTS_PATH ||
		url.pathname.startsWith(`${SHORTS_PATH}/`)
	);
}

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
	if (changeInfo.status !== "complete") return;
	if (!tab.url || !tab.id || !tab.active) return;
	if (!isShortsUrl(tab.url)) return;

	const settings = await loadSettings();
	if (!settings.redirectShorts) return;

	chrome.tabs.update(tab.id, { url: REDIRECT_URL });
});
