import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("my-component")
export class MyCounter extends LitElement {
  @property({ type: Number, reflect: true })
  count: number = 0;
  @property({ type: String, reflect: true })
  color: string = "blue";

  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
      text-align: center;
    }
    button {
      background-color: var(--color, blue);
      color: white;
      border: none;
      padding: 10px;
      cursor: pointer;
      font-size: 16px;
    }
  `;

  _increment() {
    this.count++;
    this.dispatchEvent(
      new CustomEvent("counterChanged", { detail: { count: this.count } })
    );
  }

  render() {
    return html`
      <p>Count: <strong>${this.count}</strong></p>
      <button
        @click="${this._increment}"
        style="background-color: ${this.color}"
      >
        Increment
      </button>
    `;
  }
}
