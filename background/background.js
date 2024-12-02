// サービスワーカーが動作しているか確認するログ
console.log("Service Worker is running.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateBlockedSites") {
    const blockedSites = message.blockedSites || [];

    // ブロックサイトリストをストレージに保存
    chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
      // 既存の動的ルールをすべて削除
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        const ruleIds = rules.map((rule) => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules(
          { removeRuleIds: ruleIds },
          () => {
            // 新しいルールを追加
            let ruleIdCounter = 1;
            const newRules = blockedSites.map((site) => ({
              id: ruleIdCounter++,
              priority: 1,
              action: {
                type: "redirect",
                redirect: {
                  url: chrome.runtime.getURL("block.html"),
                },
              },
              condition: {
                urlFilter: site,
                resourceTypes: ["main_frame"],
              },
            }));
            chrome.declarativeNetRequest.updateDynamicRules(
              { addRules: newRules },
              () => {
                sendResponse({ status: "success" });
              }
            );
          }
        );
      });
    });
    // 非同期でレスポンスを送信することを示す
    return true;
  }
});
