/**
 * Extension settings.
 *
 * Stored in `chrome.storage.sync` so they follow the signed-in profile across
 * machines. Every switch defaults to on: the extension exists to remove Shorts,
 * so doing nothing after install should already do that.
 */

export interface Settings {
	/** Send /shorts/... URLs back to the normal YouTube site. */
	redirectShorts: boolean;
	/** Hide the Shorts entry in the left navigation. */
	hideSidebarLink: boolean;
	/** Hide the Shorts shelf on the home feed. */
	hideHomeShelf: boolean;
	/** Hide Shorts results and shelves on the search page. */
	hideSearchResults: boolean;
	/** Hide Shorts in the watch-page sidebar and the subscriptions feed. */
	hideRelatedAndSubscriptions: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	redirectShorts: true,
	hideSidebarLink: true,
	hideHomeShelf: true,
	hideSearchResults: true,
	hideRelatedAndSubscriptions: true,
};

/** Order and labels for the popup. Keeping them here keeps the UI in sync. */
export const SETTING_LABELS: {
	key: keyof Settings;
	label: string;
	note?: string;
}[] = [
	{
		key: "redirectShorts",
		label: "Shorts を開いたら通常の YouTube へ戻す",
		note: "URL が /shorts/ のときにリダイレクトする",
	},
	{ key: "hideSidebarLink", label: "左メニューの Shorts を隠す" },
	{ key: "hideHomeShelf", label: "ホームの Shorts 棚を隠す" },
	{ key: "hideSearchResults", label: "検索結果の Shorts を隠す" },
	{
		key: "hideRelatedAndSubscriptions",
		label: "関連動画と登録チャンネルの Shorts を隠す",
	},
];

export async function loadSettings(): Promise<Settings> {
	const keys = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];
	const stored = await chrome.storage.sync.get(keys);
	// Take a stored value only when it is actually a boolean. A key that was
	// never written, or that holds something unexpected, falls back to the
	// default rather than being coerced into one.
	const result = { ...DEFAULT_SETTINGS };
	for (const key of keys) {
		const value = stored[key];
		if (typeof value === "boolean") result[key] = value;
	}
	return result;
}

export async function saveSetting<K extends keyof Settings>(
	key: K,
	value: Settings[K],
): Promise<void> {
	await chrome.storage.sync.set({ [key]: value });
}
