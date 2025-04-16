import { ChatCompletionTool } from "openai/resources/index.mjs";
import { MCPClient, IMCPClientValidation } from "../MCPClient";
import validateResearchMCP from "./validate/validateResearchMCP";
import udpateBrandColors from "./tools/updateBrandColors/";
import updateResearch from "./tools/updateResearch";

export const UPDATE_BRAND_COLORS = "update_brand_colors";

export class ResearchMCP extends MCPClient {
    async getToolsForOpenAI(): Promise<ChatCompletionTool[]> {
        const tools = [udpateBrandColors.tool, updateResearch.tool];
        return tools;
    }

    async callFunction(toolName: string, params: any): Promise<void> {
        switch (toolName) {
            case udpateBrandColors.toolName: {
                await udpateBrandColors.functionCall(this, params);
                break;
            }
            case updateResearch.toolName: {
                await updateResearch.functionCall(this, params);
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
            this.environmentId,
        );
        return validationResult;
    }
}
