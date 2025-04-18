const demaiSectionCode = `

import { LitElement, html, css } from 'lit';

class DemaiSection extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      design: { type: String },
    };
  }

  static get styles() {
    return css\`
      :host {
        display: block;
        width: 100%;
      }
        .section {
          border: 1px solid var( --demai-border-default );
          width: 100%;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

          .body {
            max-width: 900px;
            border: 1px solid var( --demai-border-default );
            width: 100%;
            height: 100%;
            flex: 1;
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
      <div class="section">
        <div class="body">
          <slot>
          </slot>
        </div>
      </div>
    \`;
  }
}

customElements.define('demai-section', DemaiSection);`;

export default demaiSectionCode;
