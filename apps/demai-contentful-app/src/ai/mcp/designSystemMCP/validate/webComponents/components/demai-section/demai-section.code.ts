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
      <slot
        class="\${this.design}"
      >
      </slot>
    \`;
  }
}

customElements.define('demai-section', DemaiSection);`;

export default demaiSectionCode;
