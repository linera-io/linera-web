import * as wasm from '@/client';
import type { Client } from '@/client';

import wasmModuleUrl from '@linera/client/pkg/linera_web_bg.wasm?url';
import * as guard from './message.guard';

export class Server {
  private subscribers = new Set<chrome.runtime.Port>();

  private constructor(private client?: Client, private wallet?: string) { }

  async setWallet(wallet: string) {
    this.wallet = wallet;
    await wasm;
    this.client = await new wasm.Client(await wasm.Wallet.create(wallet));
    this.client.on_notification((notification: any) => {
      console.debug('got notification for', this.subscribers.size, 'subscribers:', notification);
      for (const subscriber of this.subscribers.values()) {
        subscriber.postMessage(notification);
      }
    });
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
    await (await wasm).default({
      module_or_path: (await fetch(wasmModuleUrl)).arrayBuffer(),
    });

    chrome.runtime.onConnect.addListener(port => {
      if (port.name !== 'notifications') {
        console.warn('Unknown channel type', port.name);
        return;
      }

      this.subscribers.add(port);
      port.onDisconnect.addListener(port => this.subscribers.delete(port));
    });

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
