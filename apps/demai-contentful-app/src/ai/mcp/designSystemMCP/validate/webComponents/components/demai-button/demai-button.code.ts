const demaiButtonCode = `
import { LitElement, html, css } from 'lit';

class DemaiButton extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      design: { type: String },
      disabled: { type: Boolean }
    };
  }

  static get styles() {
    return css\`
      button {
        font-family: var(--demai-type-family-default);
        font-weight: var(--demai-type-weight-regular);
        border-radius: var(--demai-border-radius-md);
        padding: var(--demai-padding-1x) var(--demai-padding-2x);
        border: none;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
      }

      button.primary {
        background-color: var(--demai-color-primary-500);
        color: var(--demai-text-inverted);
      }
      button.primary:hover {
        background-color: var(--demai-color-primary-200);
      }

      button.secondary {
        background-color: var(--demai-color-secondary-500);
        color: var(--demai-text-inverted);
      }
      button.secondary:hover {
        background-color: var(--demai-color-secondary-200);
      }

      button.tertiary {
        background-color: var(--demai-color-tertiary-500);
        color: var(--demai-text-inverted);
      }
      button.tertiary:hover {
        background-color: var(--demai-color-tertiary-400);
      }

      button:disabled {
        background-color: var(--demai-background-disabled);
        color: var(--demai-text-disabled);
        cursor: not-allowed;
      }

      button:disabled:hover {
        background-color: var(--demai-background-disabled);
      }
    \`;
  }

  constructor() {
    super();
    this.label = '';
    this.design = 'primary';
    this.disabled = false;
  }

  render() {
    return html\`
      <button
        class="\${this.design}"
        ?disabled="\${this.disabled}"
      >
        \${this.label}
      </button>
    \`;
  }
}

customElements.define('demai-button', DemaiButton);`;

export default demaiButtonCode;
