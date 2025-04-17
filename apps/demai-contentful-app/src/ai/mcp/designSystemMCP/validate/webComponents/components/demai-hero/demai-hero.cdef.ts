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
    description: `A prominent section typically placed at the top of a page to highlight key messaging.
It often includes a headline, subheadline, background image or color, and a primary call to action.
The hero sets the tone for the page and draws immediate attention to important content or user actions.`,
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
