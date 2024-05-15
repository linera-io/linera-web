import * as wasm from './client/linera_web.js';
import initWasm from './client/linera_web.js';

import wasmModuleUrl from './client/linera_web_bg.wasm?url';
import * as messaging from '@/messaging';

chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
}).catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async () => {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return;
  chrome.action.setPopup({ popup: "src/popup/welcome.html" });
  await chrome.action.openPopup({ windowId });
});

self.addEventListener("activate", async () => {
  await initWasm((await fetch(wasmModuleUrl)).arrayBuffer());
  console.log("Client worker initialized");
});

chrome.runtime.onMessage.addListener((message: messaging.CallRequest, sender, respond) => {
  let functionName = message.function;

  if (sender.origin === self.location.origin) {
    console.log("Received message from extension", message);
  } else {
    console.log("Received message from content script", message);
    functionName = "dapp_" + functionName;
  }

  if (!(functionName in wasm)) {
    console.error("Attempted to call undefined function", functionName);
    return false;
  }

  let func = wasm[functionName as keyof typeof wasm] as (...args: any) => any;

  func.apply(wasm, message.arguments).then(respond);

  return true;
});
