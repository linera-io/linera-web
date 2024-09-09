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
  chrome.action.setPopup({ popup: 'src/popup/welcome.html' });
  await chrome.action.openPopup({ windowId });
});


let client: wasm.Client | undefined;
let wallet: string | undefined;

const init = (async () => {
  await initWasm({module_or_path: (await fetch(wasmModuleUrl)).arrayBuffer()});

  let wallet = await wasm.Wallet.read();

  if (wallet) {
    client = await new wasm.Client(wallet);
    console.log('Client initialized from storage');
  } else {
    console.log('No wallet available in storage');
  }
})();

async function setWallet(message: messaging.SetWalletRequest) {
  await init;
  
  console.log('Destroying old client');
  client = undefined;
  console.log('Creating new client');
  client = await new wasm.Client(await wasm.Wallet.create(wallet = message.wallet));
  console.log('New client created');
}

async function clientCall(message: messaging.CallRequest, sender: chrome.runtime.MessageSender): Promise<any> {
  if (!client) {
    console.warn('Client worker not yet initialized');
    return;
  }

  const functionName = message.function;

  let target;
  if (sender.origin === self.location.origin) {
    console.log('Received message from extension', message);
    target = client;
  } else {
    console.log('Received message from content script', message);
    target = client.frontend();
  }

  if (!(functionName in target)) {
    console.error('Attempted to call undefined function', functionName);
    return;
  }

  const func = target[functionName as keyof typeof target] as (...args: any) => Promise<any>;

  console.log('Calling function', functionName);

  const result = await func.apply(target, message.arguments);
  console.log('Got result', result);
  return result;
}

chrome.runtime.onMessage.addListener((message: messaging.Request, sender, respond) => {
  console.log('Got message', JSON.stringify(message));
  if (messaging.isCallRequest(message)) {
    clientCall(message, sender).then(respond);
    return true;
  } else if (messaging.isSetWalletRequest(message))
    setWallet(message);
  else if (messaging.isGetWalletRequest(message))
    respond(wallet);
  else
    console.warn('Unknown message', message);

  return false;
});
