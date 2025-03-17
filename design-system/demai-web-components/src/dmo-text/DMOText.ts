import {
  CDefDesignProperty,
  define,
  defineComponent,
  layoutsToCss,
} from "@contentful-demai/component-definitions/dist";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./DMOText.scss";
import semantic from "../../dist/tokens/semantic";
import { getCSSDeclarations } from "src/utils/getCSSProp";

export enum DMOTextTypeEnum {
  DisplayMD = "display-md",
  HeadingXL = "heading-xl",
  HeadingLG = "heading-lg",
  HeadingMD = "heading-md",
  HeadingSM = "heading-sm",
  HeadingXS = "heading-xs",
  BodyLG = "body-lg",
  BodyMD = "body-md",
  BodySM = "body-sm",
  LabelLG = "label-lg",
  LabelMD = "label-md",
  LabelSM = "label-sm",
  LabelXS = "label-xs",
}

@defineComponent("Demo Text", {
  designProperties: [
    {
      property: CDefDesignProperty.TEXT_COLOR,
      options: semantic.text,
    },
    { property: CDefDesignProperty.HORIZONTAL_RESIZING },
    { property: CDefDesignProperty.WIDTH },
    { property: CDefDesignProperty.HORIZONTAL_FLEX_GROW },
    { property: CDefDesignProperty.VERTICAL_RESIZING },
    { property: CDefDesignProperty.HEIGHT },
    { property: CDefDesignProperty.VERTICAL_FLEX_GROW },
    // TYPOGRAPHY (NO, DONE VIA PROPS)
    // {
    //   property: CDefDesignProperty.FONT,
    //   options: semantic.type
    // },
    // {
    //   property: CDefDesignProperty.FONT_FAMILY,
    //   options: semantic.type_family
    // },
    // {
    //   property: CDefDesignProperty.FONT_WEIGHT,
    //   options: semantic.type_weight
    // },
  ],
})
@customElement("dmo-text")
export class DmoText extends LitElement {
  static styles = styles;

  constructor() {
    super();
  }

  @define("Internal Label", { content: true })
  @property({ reflect: true })
  title: string;

  @define("Typography", {
    options: DMOTextTypeEnum,
    description: `
            This is a choice of semantic typography clusters.
            They are font, size, and weight in one targeting where and how they are used.`,
  })
  @property({ reflect: true })
  type: DMOTextTypeEnum = DMOTextTypeEnum.BodyMD;

  @define("Text", { content: true })
  @property()
  text: string = "";

  render(): object {
    return html`
      <style>
        :host {
                        ${getCSSDeclarations({
          color: this.getAttribute(CDefDesignProperty.TEXT_COLOR),
        })};
                        ${layoutsToCss(this)}
                    }
      </style>
      ${this.text}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dmo-text": DmoText;
  }
}
