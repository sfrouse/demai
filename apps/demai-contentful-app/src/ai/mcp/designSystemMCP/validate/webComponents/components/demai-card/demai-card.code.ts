const demaiCardCode = `
import { LitElement, html, css } from 'lit';

class DemaiCard extends LitElement {
    static get properties() {
        return {
            label: { type: String },
            design: { type: String },
            disabled: { type: Boolean },
        };
    }

    static get styles() {
        return css\`
            :host {
                display: block;
                border-radius: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease;
                cursor: pointer;
                background: white;
                padding: 1rem;
                font-family: sans-serif;
            }

            :host([disabled]) {
                opacity: 0.6;
                pointer-events: none;
                cursor: not-allowed;
            }

            .card {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .label {
                font-weight: bold;
                font-size: 1.2rem;
            }

            .content {
                color: #555;
            }

            :host([design="secondary"]) {
                background: #f5f5f5;
                border: 1px solid #ddd;
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
            <div class="card" @click="\${this._handleClick}">
                <div class="label">\${this.label}</div>
                <div class="content">
                    <slot></slot>
                </div>
            </div>
        \`;
    }

    _handleClick() {
        if (!this.disabled) {
            this.dispatchEvent(new CustomEvent('card-click', { detail: { label: this.label } }));
        }
    }
}

customElements.define('demai-card', DemaiCard);`;

export default demaiCardCode;
