// RepoRAG Chrome Extension - Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  console.log("RepoRAG Extension Installed");
  // Configure side panel behavior if supported
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_SIDEPANEL") {
    if (chrome.sidePanel && chrome.sidePanel.open && sender.tab?.windowId) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sendResponse({ status: "opened" });
    } else {
      sendResponse({ status: "not_supported" });
    }
  }
  return true;
});
