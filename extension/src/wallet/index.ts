import * as linera from '@linera/client';
import type { Client } from '@linera/client';

import * as guard from './message.guard';

export class Server {
  private subscribers = new Set<chrome.runtime.Port>();

  private constructor(private client?: Client, private wallet?: string) { }

  async setWallet(wallet: string) {
    this.wallet = wallet;
    await linera;
    this.client = await new linera.Client({} as linera.Wallet); // Replace with actual wallet initialization
    this.client.onNotification((notification: any) => {
      console.debug('got notification for', this.subscribers.size, 'subscribers:', notification);
      for (const subscriber of this.subscribers.values()) {
        subscriber.postMessage(notification);
      }
    });
  }

  async init() {
    await (await linera).default();

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

      if (guard.isQueryApplicationRequest(message)) {
        (async () => {
          if (!this.client) {
            console.warn('client went away');
            return;
          }
          
          const application = await this.client.frontend()
            .application(message.applicationId);
          respond(await application.query(message.query));
        })();
        return true;
      }
      
      if (sender.origin !== self.location.origin) {
        console.error('Page outside extension attempted to control client!');
        return false;
      }

      if (guard.isSetWalletRequest(message))
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
