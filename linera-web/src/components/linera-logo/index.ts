import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import lineraLogo from './logo.svg';

@customElement('linera-logo')
export class LineraLogo extends LitElement {
  static styles = css`
    img {
      padding: 2rem;
      max-width: 30rem;
    }
  `;

  render = () => html`
    <img src="${lineraLogo}" alt="Linera" />
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'linera-logo': LineraLogo
  }
}
