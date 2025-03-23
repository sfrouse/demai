class MyCounter extends LitElement {
    static properties = {
        count: { type: Number, reflect: true },
        color: { type: String, reflect: true },
    };

    static styles = css`
        :host {
            display: block;
            font-family: sans-serif;
            text-align: center;
        }
        button {
            background-color: var(--color, blue);
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            font-size: 16px;
        }
    `;

    constructor() {
        super();
        this.count = 0;
        this.color = "blue";
    }

    _increment() {
        this.count++;
    }

    render() {
        return html`
            <p>Count: <strong>${this.count}</strong></p>
            <button
                @click="${this._increment}"
                style="background-color: ${this.color}"
            >
                Increment
            </button>
        `;
    }
}

customElements.define("my-component", MyCounter);