import { ChatCompletionTool } from "openai/resources/index.mjs";

export const UPDATE_BRAND_COLORS = "update_brand_colors";

const udpateBrandColorsTool: ChatCompletionTool = {
    type: "function",
    function: {
        name: UPDATE_BRAND_COLORS,
        description:
            "Saves the brand colors for a specific design system describing a comercial brand. You should only use hex like this `#ff0000`.",
        parameters: {
            type: "object",
            properties: {
                primary: {
                    description:
                        "The main or primary color defining the brand. It is what is used most often or commonly. You should only use hex like this `#ff0000`.",
                    type: "string",
                },
                secondary: {
                    description:
                        "The secondary color defining the brand. It is what is used most often after the primary color. You should only use hex like this `#ff0000`.",
                    type: "string",
                },
                tertiary: {
                    description:
                        "The tertiary color defining the brand. It is what is used most often after the secondary. You should only use hex like this `#ff0000`.",
                    type: "string",
                },
                additionalProperties: false,
            },
            required: ["primary", "secondary", "tertiary"],
        },
    },
};

export default udpateBrandColorsTool;
