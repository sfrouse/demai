import { ChatCompletionTool } from "openai/resources/index.mjs";

export const UPDATE_BRAND_COLORS = "update_brand_colors";

const udpateBrandColorsTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: UPDATE_BRAND_COLORS,
    description:
      "Saves the brand colors for a specific design system describing a comercial brand.",
    parameters: {
      type: "object",
      properties: {
        primary: {
          description:
            "The main or primary color defining the brand. It is what is used most often or commonly.",
          type: "string",
        },
        secondary: {
          description:
            "The secondary color defining the brand. It is what is used most often after the primary color.",
          type: "string",
        },
        tertiary: {
          description:
            "The tertiary color defining the brand. It is what is used most often after the secondary.",
          type: "string",
        },
        additionalProperties: false,
      },
      required: ["primary", "secondary", "tertiary"],
    },
  },
};

export default udpateBrandColorsTool;
