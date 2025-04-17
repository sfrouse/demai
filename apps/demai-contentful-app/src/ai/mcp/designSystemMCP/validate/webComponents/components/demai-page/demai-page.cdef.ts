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
    description: `A layout wrapper that represents a full web page, including its header, footer, and overall structure.
It provides the outer frame for content and is responsible for consistent spacing, theming, and layout rules.
All page-specific content is passed as children, making this component the foundation for rendering complete views in an application.`,
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
