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
    
    const clientInstance = new wasm.Client(await wasm.Wallet.create(wallet));
    this.client = clientInstance;
    
    clientInstance.on_notification((notification: Notification) => {
      console.debug('Received notification for', this.subscribers.size, 'subscribers:', notification);
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

    try {
      let target;
      if (sender.origin === self.location.origin) {
        console.log('Received call from extension', functionName, args);
        target = this.client;
      } else {
        console.log('Received call from content script', functionName, args);
        target = this.client.frontend();
      }

      if (typeof target[functionName] !== 'function') {
        console.error('Attempted to call undefined function', functionName);
        return;
      }

      const func = target[functionName as keyof typeof target] as (...args: any) => Promise<any>;

      console.debug('Calling function', functionName);
      const result = await func.apply(target, args);
      console.debug('Got result', result);
      return result;
      
    } catch (error) {
      console.error('Error calling client function:', error);
    }
  }

  async init() {
    await this.loadWasmModule();
    this.setupNotificationListener();
    this.setupMessageListener();
  }

  private async loadWasmModule() {
    await wasm;
    await wasm.default({
      module_or_path: (await fetch(wasmModuleUrl)).arrayBuffer(),
    });
  }

  private setupNotificationListener() {
    chrome.runtime.onConnect.addListener(port => {
      if (port.name !== 'notifications') {
        console.warn('Unknown channel type', port.name);
        return;
      }

      this.subscribers.add(port);
      port.onDisconnect.addListener(() => this.removeSubscriber(port));
    });
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
      if (message.target !== 'wallet') return false;

      switch (true) {
        case guard.isCallRequest(message):
          this.handleCallRequest(sender, message, respond);
          return true;

        case guard.isSetWalletRequest(message):
          this.setWallet(message.wallet);
          return true;

        case guard.isGetWalletRequest(message):
          respond(this.wallet);
          return true;

        default:
          console.warn('Unknown message', message);
          return false;
      }
    });
  }

  private async handleCallRequest(sender: chrome.runtime.MessageSender, message: any, respond: Function) {
    const result = await this.callClientFunction(sender, message.function, ...message.arguments);
    respond(result);
  }

  private removeSubscriber(port: chrome.runtime.Port) {
    this.subscribers.delete(port);
    port.onDisconnect.removeListener(() => this.removeSubscriber(port));
  }

  public static async run() {
    new Server().init();
  }
}
