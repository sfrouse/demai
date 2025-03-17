import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  define,
  defineComponent,
} from "@contentful-demai/component-definitions/dist";
import styles from "./DMOPage.scss";

@defineComponent("DMO Page", {
  slots: [
    {
      label: "Body",
      property: "body",
      defaultSlot: true,
    },
  ],
  contentful: {
    builtInStyles: ["cfWidth"], // fills the Studio page
  },
})
@customElement("dmo-page")
export class DMOPage extends LitElement {
  static styles = styles;

  @define("Title", { content: true })
  @property()
  title: string = "";

  @define("Slug", { content: true })
  @property()
  slug: string = "";

  render(): object {
    return html`<div class="root">
      <div class="header">${this.title}</div>
      <slot></slot>
      <div class="footer">${this.title}</div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dmo-page": DMOPage;
  }
}
