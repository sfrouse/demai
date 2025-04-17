import type { CDefDefinition } from "demai-component-definitions/dist/types.d.ts";

const demaiCardCDef: CDefDefinition = {
    $id: "demai-card.cdef.json",
    type: "object",
    "x-cdef": {
        tag: "demai-card",
        name: "Demai Card",
        className: "DemaiCard",
    },
    $schema: "https://json-schema.org/draft-07/schema",
    $comment: "AI GENERATED",
    description: `A reusable UI block for presenting related content, such as a title, description, and optional metadata or actions.
Cards help organize content into clear, consistent sections and support design variants and disabled states.
Often used in grids or lists to preview pages, products, or other interactive elements.`,
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
            description: "The text displayed on the card.",
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
                "The design style of the card, based on color types from the design system.",
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
            description: "Whether the card is disabled.",
        },
        $identifier: {
            type: ["string", "object"],
        },
    },
    additionalProperties: false,
};

export default demaiCardCDef;
