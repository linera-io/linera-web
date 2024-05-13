import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

type Wallet = {
  default: string;
};

@customElement('linera-wallet-picker')
export class WalletPicker extends LitElement {
  static styles = css`
    input[type="file"] {
      display: none;
    }

    label {
      background-color: var(--color-linera-teal);
      padding: 0.75em;
      border-radius: 0.75em;
      font-weight: bold;
      display: inline-block;
    }
  `;

  @property()
  wallet?: Wallet;

  @property()
  onChange?: (event: Event) => void;

  render = () => html`
    <form>
      <label for="wallet">Set wallet…</label>
      <input id="wallet" type="file" accept=".json" @change=${this._onChange}>
    </form>
  `;

  private async _onChange(event: Event & { target: HTMLInputElement }) {
    const contents = await event.target.files![0].text();
    this.onChange?.(contents);
  }
}

@customElement('linera-sidebar')
export class Sidebar extends LitElement {
  wallet?: Wallet;

  static styles = css`
    .chain-id {
      background-color: var(--color-linera-beige);
      font-family: monospace;
      overflow-wrap: break-word;
      padding: 3px;
    }
  `;

  render = () => html`
    <h2>Wallet</h2>
    ${this.wallet && html`<p>Your current wallet is <span class="chain-id">${this.wallet.default}</span>.</p>`}
    <linera-wallet-picker></linera-wallet-picker>
  `;

  constructor() {
    super();
    let wallet = window.localStorage.getItem("wallet");
    if (wallet) this.wallet = JSON.parse(wallet);
  }

  private async onWalletChange(wallet: string) {
    window.localStorage.setItem("wallet", wallet);
    this.wallet = JSON.parse(wallet);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'linera-sidebar': Sidebar
  }
}
