import { ChatCompletionTool } from "openai/resources/index.mjs";
import { MCPClient, IMCPClientValidation } from "../MCPClient";
import udpateBrandColorsTool from "./functions/updateBrandColorsTool";
import validateResearchMCP from "./validate/validateResearchMCP";

export const UPDATE_BRAND_COLORS = "update_brand_colors";

export class ResearchMCP extends MCPClient {
  async getToolsForOpenAI(): Promise<ChatCompletionTool[]> {
    return [udpateBrandColorsTool.tool];
  }

  async callFunction(toolName: string, params: any): Promise<void> {
    switch (toolName) {
      case udpateBrandColorsTool.toolName: {
        await udpateBrandColorsTool.functionCall(this, params);
        break;
      }
      default: {
        console.error(`Error: Unknown tool: ${toolName}`);
        break;
      }
    }
  }

  async validate(): Promise<IMCPClientValidation> {
    const validationResult = await validateResearchMCP(
      this.cma,
      this.spaceId,
      this.environmentId
    );
    return validationResult;
  }
}
