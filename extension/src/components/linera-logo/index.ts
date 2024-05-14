import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import lineraLogo from './logo.svg?url';

@customElement('linera-logo')
export class Logo extends LitElement {
  static styles = css`
    img {
      padding: 0.5rem;
      max-height: 3rem;
    }
  `;

  render = () => html`
    <img src="${lineraLogo}" alt="Linera" />
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'linera-logo': Logo;
  }
}
