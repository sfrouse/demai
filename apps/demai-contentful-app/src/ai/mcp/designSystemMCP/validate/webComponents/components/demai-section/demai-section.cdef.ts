import type { CDefDefinition } from "demai-component-definitions/dist/types.d.ts";

const demaiSectionCDef: CDefDefinition = {
  $id: "demai-section.cdef.json",
  type: "object",
  "x-cdef": {
    tag: "demai-section",
    name: "Demai Section",
    className: "DemaiSection",
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
      description: "The text displayed on the section.",
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
        "The design style of the section, based on color types from the design system.",
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
      description: "Whether the section is disabled.",
    },
    $identifier: {
      type: ["string", "object"],
    },
  },
  additionalProperties: false,
};

export default demaiSectionCDef;
