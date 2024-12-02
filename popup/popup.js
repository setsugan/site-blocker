document.addEventListener("DOMContentLoaded", () => {
  const siteInput = document.getElementById("siteInput");
  const addSiteButton = document.getElementById("addSiteButton");
  const blockedList = document.getElementById("blockedList");

  function updateBlockedList() {
    chrome.storage.sync.get("blockedSites", (data) => {
      blockedList.innerHTML = "";
      const sites = data.blockedSites || [];
      sites.forEach((site) => {
        const li = document.createElement("li");
  
        // URLを正しい形式に補完
        let fullUrl;
        try {
          fullUrl = new URL(site);
        } catch (e) {
          // siteが "x.com" のような場合、自動で "https://" を付ける
          fullUrl = new URL(`https://${site}`);
        }
  
        // ファビコンを取得
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${fullUrl.hostname}`;
        const siteIcon = document.createElement("img");
        siteIcon.src = faviconUrl;
        siteIcon.alt = "Site Icon";
        siteIcon.style.width = "16px";
        siteIcon.style.height = "16px";
        siteIcon.style.marginRight = "10px";
  
        const siteText = document.createElement("span");
        siteText.textContent = site;
  
        const removeButton = document.createElement("button");
        removeButton.textContent = "削除";
        removeButton.onclick = () => {
          const updatedSites = sites.filter((s) => s !== site);
          chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
            updateBlockedList();
          });
        };
  
        li.appendChild(siteIcon); // ファビコンを追加
        li.appendChild(siteText);
        li.appendChild(removeButton);
        blockedList.appendChild(li);
      });
    });
  }
  
  
  

  addSiteButton.onclick = () => {
    const site = siteInput.value.trim();
    if (site) {
      chrome.storage.sync.get("blockedSites", (data) => {
        const sites = data.blockedSites || [];
        if (!sites.includes(site)) {
          chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
            const existingIds = existingRules.map((rule) => rule.id);
            const newId = Math.max(0, ...existingIds) + 1; // 一意のIDを生成
  
            sites.push(site);
            chrome.storage.sync.set({ blockedSites: sites }, () => {
              chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [
                  {
                    id: newId,
                    priority: 1,
                    action: {
                      type: "redirect",
                      redirect: {
                        url: chrome.runtime.getURL("block.html")
                      }
                    },
                    condition: {
                      // サブドメインやリダイレクトも含む
                      urlFilter: `*://${site}/*`,
                      resourceTypes: ["main_frame"]
                    }
                  }
                ]
              }, () => {
                updateBlockedList();
              });
            });
          });
        }
      });
    }
    siteInput.value = "";
  };
  
  

  updateBlockedList();
});
