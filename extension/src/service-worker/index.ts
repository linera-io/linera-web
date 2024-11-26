import * as offscreen from './offscreen';

chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
}).catch(console.error);

chrome.runtime.onInstalled.addListener(async () => {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return;
  chrome.action.setPopup({ popup: 'src/popup/welcome.html' });
  await chrome.action.openPopup({ windowId });
});

offscreen.setup();
