import { enabledStorage, incrementBlockCount } from "@/utils/storage";

const SHORTS_PATTERN = /youtube\.com\/shorts/i;
const YOUTUBE_HOME = "https://www.youtube.com";

export default defineBackground(() => {
	browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
		if (changeInfo.status !== "complete" || !tab.url) return;

		const isEnabled = await enabledStorage.getValue();
		if (!isEnabled) return;

		if (SHORTS_PATTERN.test(tab.url)) {
			await browser.tabs.update(tabId, { url: YOUTUBE_HOME });
			await incrementBlockCount();
		}
	});
});
