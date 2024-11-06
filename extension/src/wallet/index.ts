import * as wasm from './client/linera_web.js';
import type { Client } from './client/linera_web.js';

import wasmModuleUrl from './client/linera_web_bg.wasm?url';
import * as guard from './message.guard';

export class Server {
  private constructor(private client?: Client, private wallet?: string) { }

  async setWallet(wallet: string) {
    this.wallet = wallet;
    this.client = await new (await wasm).Client(await (await wasm).Wallet.create(wallet));
  }

  async callClientFunction(sender: chrome.runtime.MessageSender, functionName: string, ...args: any): Promise<any> {
    if (!this.client) {
      console.warn('No wallet set');
      return;
    }

    let target;
    if (sender.origin === self.location.origin) {
      console.log('Received call from extension', functionName, args);
      target = this.client;
    } else {
      console.log('Received call from content script', functionName, args);
      target = this.client.frontend();
    }

    if (!(functionName in target)) {
      console.error('Attempted to call undefined function', functionName);
      return;
    }

    let func = target[functionName as keyof typeof target] as (...args: any) => Promise<any>;

    console.debug('Calling function', functionName);

    const result = await func.apply(target, args);
    console.debug('Got result', result);
    return result;
  }

  async init() {
    // const worker = new Worker(exampleWorkerUrl);
    // const messaged = new Promise(resolve => {
    //   worker.onmessage = e => {
    //     resolve(e);
    //   };
    // });
    // worker.postMessage('hello');
    // console.log('resolved', await messaged);

    await (await wasm).default({
      module_or_path: (await fetch(wasmModuleUrl)).arrayBuffer(),
    });

    // TODO enable this after wallet storage works again
    // let wallet = await wasm.Wallet.read();
    // if (wallet) {
    //   this.client = await new wasm.Client(wallet);
    //   console.debug('Client initialized from storage');
    // } else {
    //   console.debug('No wallet available in storage');
    // }

    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if (message.target !== 'wallet')
        return false;

      if (guard.isCallRequest(message)) {
        this.callClientFunction(sender, message.function, ...message.arguments)
          .then(respond);
        return true;
      } else if (guard.isSetWalletRequest(message))
        this.setWallet(message.wallet);
      else if (guard.isGetWalletRequest(message))
        respond(this.wallet);
      else
        console.warn('Unknown message', message);

      return false;
    });
  }

  public static async run() {
    new Server().init();
  }
}
