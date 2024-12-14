import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import buttonStyles from '@shoelace-style/shoelace/dist/components/button/button.styles.js';
import '@/shoelace.ts';
import * as popup from '@/popup';

interface Wallet {
  default: string;
}

@customElement('linera-wallet-picker')
export class WalletPicker extends LitElement {
  static styles = css`
    input[type='file'] {
      display: none;
    }

    label {
      display: inline-block;
      position: relative;
      width: auto;
      cursor: pointer;
      box-sizing: border-box;
    }

    ${buttonStyles}

    .button__label {
      color: var(--color-foreground);
    }
  `;

  @property()
  onChange?: (wallet: string) => Promise<void>;

  render() {
    return html`
      <form>
        <label class='button button--standard button--primary button--medium button--has-label' for='wallet'>
          <span class='button__label'>Set wallet…</span>
        </label>
        <input id='wallet' type='file' accept='.json' @change=${this._onChange}>
      </form>
    `;
  }

  private async _onChange(event: Event & { target: HTMLInputElement }) {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        console.error('No file selected');
        return;
      }
      
      const contents = await file.text();
      await this.onChange?.(contents);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }
}

@customElement('linera-confirm-button')
export class ConfirmButton extends LitElement {
  @property()
  confirmed?: boolean;

  static styles = css`
    sl-button::part(label) {
      color: var(--color-foreground);
    }
  `;

  render() {
    return html`
      <sl-button @click=${this.confirmSomething} variant='primary'>
        Confirm something
        ${this.confirmed === true ? '✓'
          : this.confirmed === false ? '✗'
          : '' }
      </sl-button>
    `;
  }

  private async confirmSomething(_event: Event & { target: HTMLButtonElement }) {
    this.confirmed = await popup.confirm('Would you like to do something?');
  }
}

@customElement('linera-sidebar')
export class Sidebar extends LitElement {
  @state() wallet?: Wallet;
  @state() loading: boolean = false;

  static styles = css`
    .chain-id {
      background-color: var(--color-linera-beige-200);
      font-family: monospace;
      overflow-wrap: break-word;
      padding: 3px;
    }
  `;

  render() {
    return html`
      <h2>Wallet</h2>
      ${this.loading ? html`<p>Loading...</p>` : ''}
      ${this.wallet
        ? html`<p>Your current wallet is <span class='chain-id'>${this.wallet.default}</span>.</p>`
        : html`<p>You don't currently have a wallet selected.</p>`}
      <linera-wallet-picker .onChange=${(wallet: string) => this.onWalletChange(wallet)}></linera-wallet-picker>
      <linera-confirm-button></linera-confirm-button>
    `;
  }

  constructor() {
    super();
    (async () => {
      try {
        this.wallet = await this.sendMessage({ type: 'get_wallet', target: 'wallet' });
      } catch (error) {
        console.error('Error fetching wallet:', error);
      }
    })();
  }

  private async sendMessage<T>(message: object): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
        } else {
          resolve(response);
        }
      });
    });
  }

  private async onWalletChange(wallet: string) {
    this.loading = true;
    try {
      await this.sendMessage({ type: 'set_wallet', target: 'wallet', wallet });
      this.wallet = JSON.parse(wallet);
    } catch (error) {
      console.error('Error setting wallet:', error);
    } finally {
      this.loading = false;
    }
  }
}
