import type { CDefDefinition } from "demai-component-definitions/dist/types.d.ts";

const demaiPageCDef: CDefDefinition = {
  $id: "demai-page.cdef.json",
  type: "object",
  "x-cdef": {
    tag: "demai-page",
    name: "Demai Page",
    className: "DemaiPage",
  },
  $schema: "https://json-schema.org/draft-07/schema",
  $comment: "AI GENERATED",
  description:
    "A reusable, styled component that triggers actions and maintains consistent visual language across products.",
  properties: {
    label: {
      type: "string",
      title: "Label",
      "x-cdef": {
        input: {
          label: "Label",
        },
        output: {
          webComponent: {
            attribute: "label",
          },
        },
      },
      $schema: "https://json-schema.org/draft-07/schema",
      description: "The text displayed on the page.",
    },
    design: {
      enum: ["primary", "secondary", "tertiary"],
      type: "string",
      title: "Design",
      "x-cdef": {
        input: {
          label: "Design",
          options: {
            Primary: "primary",
            Tertiary: "tertiary",
            Secondary: "secondary",
          },
          defaultValue: "primary",
        },
        output: {
          webComponent: {
            attribute: "design",
          },
        },
      },
      $schema: "https://json-schema.org/draft-07/schema",
      description:
        "The design style of the page, based on color types from the design system.",
    },
    $schema: {
      type: "string",
    },
    disabled: {
      type: "boolean",
      title: "Disabled",
      "x-cdef": {
        input: {
          label: "Disabled",
          defaultValue: "false",
        },
        output: {
          webComponent: {
            attribute: "disabled",
          },
        },
      },
      $schema: "https://json-schema.org/draft-07/schema",
      description: "Whether the page is disabled.",
    },
    $identifier: {
      type: ["string", "object"],
    },
  },
  additionalProperties: false,
};

export default demaiPageCDef;
