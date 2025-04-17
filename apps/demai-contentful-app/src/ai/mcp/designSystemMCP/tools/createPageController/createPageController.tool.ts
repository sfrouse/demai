import { ChatCompletionTool } from "openai/resources/index.mjs";

export const CREATE_PAGE_CONTROLLER = "create_page_controller";

const createPageControllerTool: ChatCompletionTool = {
    type: "function",
    function: {
        name: CREATE_PAGE_CONTROLLER,
        description:
            "Creates a controller that defines the view components needed to layout a web page as well as the content that is bound to those views. Think of it as creating a web page.",
        parameters: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description:
                        "The unique identifier for the page controller. It should be lowercase, only letters.",
                },
                title: {
                    type: "string",
                    description:
                        "A unique name of the page controller in a more user friendly way. It should generally be the id but with spaces and capital case.",
                },
                slug: {
                    type: "string",
                    description:
                        "A descriptive string that can be used in a url. It should give some hint of what the page is about. Just letters and numbers and forward slashes. Always start with a forward slash. This is an example: '/my-new-page'.",
                },
                description: {
                    type: "string",
                    description:
                        "A description of what the page controller is and why you would use it.",
                },
                view: {
                    type: "string",
                    description:
                        "The id of the single view entry that this controller is showing and binding to content. It has to be a specific type of entry and options will be presented to you.",
                },
                modelBindings: {
                    type: "array",
                    description:
                        "A list of content ids that will be bound to the view.",
                    items: {
                        type: "string",
                        description:
                            "The id of a content entry. These will be presented to you and you should choose the appropriate content based on the title.",
                    },
                },
                children: {
                    type: "array",
                    description:
                        "Child page controllers. Each one is a full page controller object and may have its own children (up to 4 levels deep).",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            slug: { type: "string" },
                            description: { type: "string" },
                            view: { type: "string" },
                            modelBindings: {
                                type: "array",
                                items: { type: "string" },
                            },
                            children: {
                                type: "array",
                                description:
                                    "Second-level children (nested controllers).",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        slug: { type: "string" },
                                        description: { type: "string" },
                                        view: { type: "string" },
                                        modelBindings: {
                                            type: "array",
                                            items: { type: "string" },
                                        },
                                        children: {
                                            type: "array",
                                            description:
                                                "Third-level children (nested controllers).",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    name: { type: "string" },
                                                    slug: { type: "string" },
                                                    description: {
                                                        type: "string",
                                                    },
                                                    view: { type: "string" },
                                                    modelBindings: {
                                                        type: "array",
                                                        items: {
                                                            type: "string",
                                                        },
                                                    },
                                                    children: {
                                                        type: "array",
                                                        description:
                                                            "Fourth-level children (deepest level). No further nesting allowed.",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                id: {
                                                                    type: "string",
                                                                },
                                                                name: {
                                                                    type: "string",
                                                                },
                                                                slug: {
                                                                    type: "string",
                                                                },
                                                                description: {
                                                                    type: "string",
                                                                },
                                                                view: {
                                                                    type: "string",
                                                                },
                                                                modelBindings: {
                                                                    type: "array",
                                                                    items: {
                                                                        type: "string",
                                                                    },
                                                                },
                                                                children: {
                                                                    type: "array",
                                                                    description:
                                                                        "Maximum depth reached. This array must remain empty.",
                                                                    items: {
                                                                        type: "object",
                                                                        properties:
                                                                            {},
                                                                        additionalProperties:
                                                                            false,
                                                                    },
                                                                },
                                                            },
                                                            required: [
                                                                "id",
                                                                "name",
                                                                "slug",
                                                                "description",
                                                                "view",
                                                                "modelBindings",
                                                                "children",
                                                            ],
                                                            additionalProperties:
                                                                false,
                                                        },
                                                    },
                                                },
                                                required: [
                                                    "id",
                                                    "name",
                                                    "slug",
                                                    "description",
                                                    "view",
                                                    "modelBindings",
                                                    "children",
                                                ],
                                                additionalProperties: false,
                                            },
                                        },
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "slug",
                                        "description",
                                        "view",
                                        "modelBindings",
                                        "children",
                                    ],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: [
                            "id",
                            "name",
                            "slug",
                            "description",
                            "view",
                            "modelBindings",
                            "children",
                        ],
                        additionalProperties: false,
                    },
                },
            },
            additionalProperties: false,
            required: [
                "id",
                "name",
                "slug",
                "description",
                "view",
                "modelBindings",
                "children",
            ],
        },
    },
};

export default createPageControllerTool;
