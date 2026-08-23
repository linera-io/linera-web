import * as linera from '@linera/client';
import type { Client } from '@linera/client';

import * as guard from './message.guard';

type WalletMetadata = {
  default: string;
};

function parseWalletMetadata(wallet: string): WalletMetadata {
  let value: unknown;
  try {
    value = JSON.parse(wallet);
  } catch {
    throw new Error('The selected wallet file is not valid JSON');
  }

  if (
    value === null
    || typeof value !== 'object'
    || typeof (value as { default?: unknown }).default !== 'string'
  ) {
    throw new Error('The selected wallet file does not contain a valid default chain');
  }

  return { default: (value as { default: string }).default };
}

export class Server {
  private subscribers = new Set<chrome.runtime.Port>();

  private constructor(private client?: Client, private wallet?: WalletMetadata) { }

  async setWallet(wallet: string) {
    const metadata = parseWalletMetadata(wallet);
    const previousClient = this.client;
    this.client = undefined;
    this.wallet = metadata;

    if (previousClient) {
      try {
        await previousClient.asyncDispose();
      } catch (error) {
        console.warn('Failed to dispose the previous wallet client', error);
      }
    }

    // The browser client does not expose a supported import API for CLI wallet JSON.
    // Never fall back to an embedded or otherwise unvalidated private key.
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
          try {
            if (!this.client) {
              const error = 'Wallet queries are unavailable until a supported wallet client is initialized';
              console.warn(error);
              respond({ error });
              return;
            }

            const application = await this.client.frontend()
              .application(message.applicationId);
            respond(await application.query(message.query));
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Wallet application query failed', error);
            respond({ error: message });
          }
        })();
        return true;
      }
      
      if (sender.origin !== self.location.origin) {
        console.error('Page outside extension attempted to control client!');
        return false;
      }

      if (guard.isSetWalletRequest(message))
        this.setWallet(message.wallet).catch(error => {
          console.error('Failed to load wallet', error);
        });
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
