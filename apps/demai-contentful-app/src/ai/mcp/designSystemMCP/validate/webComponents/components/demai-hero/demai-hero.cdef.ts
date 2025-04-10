import type { CDefDefinition } from "demai-component-definitions/dist/types.d.ts";

const demaiHeroCDef: CDefDefinition = {
  $id: "demai-hero.cdef.json",
  type: "object",
  "x-cdef": {
    tag: "demai-hero",
    name: "Demai Hero",
    className: "DemaiHero",
  },
  $schema: "https://json-schema.org/draft-07/schema",
  $comment: "AI GENERATED",
  description:
    "A reusable, styled component that triggers actions and maintains consistent visual language across products.",
  properties: {
    title: {
      type: "string",
      title: "Title",
      "x-cdef": {
        input: {
          label: "Title",
        },
        output: {
          webComponent: {
            attribute: "title",
          },
        },
      },
      $schema: "https://json-schema.org/draft-07/schema",
      description: "The title on the hero.",
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
      description: "Whether the hero is disabled.",
    },
    $identifier: {
      type: ["string", "object"],
    },
  },
  additionalProperties: false,
};

export default demaiHeroCDef;
