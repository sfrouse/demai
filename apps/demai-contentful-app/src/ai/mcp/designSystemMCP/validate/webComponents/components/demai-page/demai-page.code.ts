const demaiPageCode = `
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
    <div>
      <div>
       header
      </div>
      <slot></slot>
      <div>
       footer
      </div>
    </div>
    \`;
  }
}

customElements.define('demai-page', DemaiPage);`;

export default demaiPageCode;
