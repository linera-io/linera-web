chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
}).catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => (async () => {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return;
  chrome.action.setPopup({ popup: "src/welcome/index.html" });
  await chrome.action.openPopup({ windowId });
})());
