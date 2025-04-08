import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import updateBrandColors from "../../../../mcp/researchMCP/tools/updateBrandColors";
import updateResearch from "../../../../mcp/researchMCP/tools/updateResearch";
import { AIModels } from "../../../../openAI/openAIConfig";
import { AIPromptEngine } from "../../AIPromptEngine";
import { AIPromptConfig } from "../../AIPromptEngineTypes";

export class SaveBrandColorsEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

    this.model = AIModels.gpt4o;
    this.introMessage = "Let’s do some research. What would you like to do?";
    this.executionPrompt = "Researching...";
    this.placeholder = "Try to be descriptive...";
    this.system = {
      role: "system",
      content: `
You are an expert in figuring out how to save information gathered about a website's brand and
how it should fit into the tools provided.

You will be asked to store information about colors, tone, style, description, products, 
and possibly more for that brand.

Your only goal is to put the information in the rigth spot in the tool.

Only send the information that you recieve in the prompt.

For instance, if you get a brand description, don't try to update the colors or tone, etc.

`,
    };
    this.toolType = "Research";
    this.toolFilters = [updateBrandColors.toolName, updateResearch.toolName];

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [];

    // CONTENT
    this.content = (userContent: string) => {
      return `${userContent}`;
    };
  }
}
