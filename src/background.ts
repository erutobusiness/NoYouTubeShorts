const targetUrl = "youtube.com/shorts";
const redirectUrl = "https://www.youtube.com";

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url && tab.id && tab.active) {
		// URLが特定のドメインを含むかチェック
		if (tab.url.includes(targetUrl)) {
			// 指定されたドメインにリダイレクト
			chrome.tabs.update(tab.id, { url: redirectUrl });
		}
	}
});
