const demaiHeroCode = `
import { LitElement, html, css } from 'lit';

class DemaiHero extends LitElement {
  static get properties() {
    return {
      title: { type: String },
    };
  }

  static get styles() {
    return css\`
      
    \`;
  }

  constructor() {
    super();
    this.title = '';
  }

  render() {
    return html\`
      <div>
        \${this.title}
      </div>
    \`;
  }
}

customElements.define('demai-hero', DemaiHero);`;

export default demaiHeroCode;
