const demaiCardCode = `
import { LitElement, html, css } from 'lit';

class DemaiCard extends LitElement {
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
        \${this.label}
      </div>
    \`;
  }
}

customElements.define('demai-card', DemaiCard);`;

export default demaiCardCode;
