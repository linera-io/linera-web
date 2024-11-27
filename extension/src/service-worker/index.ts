import * as offscreen from './offscreen';

chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
}).catch(console.error);

chrome.runtime.onInstalled.addListener(async () => {
  // This should load `linera_web.js`, marking it as offline from now on.
  // import('./client/linera_web.js');

  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return;
  chrome.action.setPopup({ popup: 'src/popup/welcome.html' });
  await chrome.action.openPopup({ windowId });
});

offscreen.setup();
