const demaiSectionCode = `
import { LitElement, html, css } from 'lit';

class DemaiPage extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      design: { type: String },
      disabled: { type: Boolean }
    };
  }

  static get styles() {
    return css\`
      :host {
        display: block;
        width: 100%;
      }

      .page {
        font: var( --demai-type-body-md );
        width: 100%;
      }

      .page, .page * {
        box-sizing: border-box;
      }

        .header {
          padding: var( --demai-spacing-3x );
          width: 100%;
          background-color: var( --demai-background-primary-default );
        }

        .footer {
          padding: var( --demai-spacing-3x );
          width: 100%;
          color: var( --demai-text-inverted );
          background-color: var( --demai-background-secondary-default );
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
    <div class="page">
      <div class="header">
       header
      </div>
      <slot></slot>
      <div class="footer">
       footer
      </div>
    </div>
    \`;
  }
}

customElements.define('demai-page', DemaiPage);`;

export default demaiSectionCode;
