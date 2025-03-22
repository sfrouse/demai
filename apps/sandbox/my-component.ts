import { LitElement, html, css } from "lit";
// import { property } from "lit/decorators.js";

export class MyComponent extends LitElement {
  label: string = "Click Me";

  static styles = css`
    button {
      background: purple;
      color: white;
      padding: 8px 16px;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
  `;

  render() {
    return html`<button @click=${() => alert("Clicked!")}>
      ${this.label}
    </button>`;
  }
}

customElements.define("my-component", MyComponent);
