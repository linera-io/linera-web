import * as wallet from './wallet';

chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
}).catch(console.error);

chrome.runtime.onInstalled.addListener(async () => {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return;
  chrome.action.setPopup({ popup: 'src/popup/welcome.html' });
  await chrome.action.openPopup({ windowId });
});

wallet.Server.run();
