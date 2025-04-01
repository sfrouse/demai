import { DesignSystemMCPClient } from "../../designSystemMCP/DesignSystemMCPClient";
import { IMCPTool } from "../../MCPClient";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../validate/ctypes/demaiResearchCType";
import { updateResearchSingleton } from "./utils/updateResearchSIngleton";

export const UPDATE_BRAND_COLORS = "update_brand_colors";

const udpateBrandColorsTool: IMCPTool = {
  toolName: UPDATE_BRAND_COLORS,
  // TODO: auto generate...
  tool: {
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
  },
  functionCall: async (mcp: DesignSystemMCPClient, params: any) => {
    const entry = await updateResearchSingleton(
      mcp.cma,
      mcp.spaceId,
      mcp.environmentId,
      DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
      {
        // title: params.name, // don't change...
        primaryColor: params.primary,
        secondaryColor: params.secondary,
        tertiaryColor: params.tertiary,
      }
    );

    return {
      content: [
        {
          type: "object",
          text: entry,
        },
      ],
    };
  },
};

export default udpateBrandColorsTool;
