import '@/shoelace.ts';
import '@/index.css';
import '@/components/linera-logo';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('linera-confirmation-form')
export class ConfirmationForm extends LitElement {
  question: string;
  requestId: string;

  static styles = css`
    p { font-weight: bold; font-size: 1.2em; }

    sl-button-group {
      display: flex;
      gap: 0.5rem;
    }

    sl-button {
      flex-grow: 1;
    }

    sl-button::part(label) {
      color: var(--color-foreground);
    }
  `;

  constructor() {
    super();
    const params = new URLSearchParams(window.location.search);
    this.question = params.get("question")!;
    this.requestId = params.get("requestId")!;
  }

  render = () => html`
    <p>${this.question}</p>
    <sl-button-group>
      <sl-button @click=${async () => this.respond(false)}>No</sl-button>
      <sl-button variant="primary" @click=${async () => this.respond(true)}>Yes</sl-button>
    </sl-button-group>
  `;

  private async respond(response: boolean): Promise<void> {
    chrome.runtime.sendMessage({ type: "confirm_response", requestId: this.requestId, response });
    window.close();
  }
}
