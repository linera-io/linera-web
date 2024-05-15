import * as wasm from './client/linera_web.js';
import initWasm from './client/linera_web.js';

import wasmModuleUrl from './client/linera_web_bg.wasm?url';

chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
}).catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async () => {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return;
  chrome.action.setPopup({ popup: "src/welcome/index.html" });
  await chrome.action.openPopup({ windowId });
});

self.addEventListener("activate", async () => {
  await initWasm((await fetch(wasmModuleUrl)).arrayBuffer());
  console.log("query: ", await wasm.query(12));
});

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  wasm.query.call(null, message.arguments).then(respond);
  return true;
});
