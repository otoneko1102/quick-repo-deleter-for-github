chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get("agreed", (data) => {
    if (!data.agreed) {
      chrome.tabs.create({ url: "pages/welcome/index.html" });
      chrome.storage.sync.set({ agreed: false, autoClickFinalDelete: true });
    }
  });
});
