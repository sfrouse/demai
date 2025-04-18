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
      :host {
        display: block;
        width: 100%;
      }

        .hero {
          border: 1px solid var( --demai-border-default );
          width: 100%;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font: var( --demai-type-heading-md );
        }

        .hero, .hero * {
          box-sizing: border-box;
        }
    \`;
  }

  constructor() {
    super();
    this.title = '';
  }

  render() {
    return html\`
      <div class="hero">
        \${this.title}
      </div>
    \`;
  }
}

customElements.define('demai-hero', DemaiHero);`;

export default demaiHeroCode;
