import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AIModels } from "../../../../openAI/openAIConfig";
import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";

export class SaveBrandColorsEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.model = AIModels.gpt4o;
    this.introMessage = "Let’s do some research. What would you like to do?";
    this.executionPrompt = "Researching...";
    this.placeholder = "Try to be descriptive...";
    this.system = {
      role: "system",
      content: `
You are an expert in design system colors and can figure out what a website's brand design system colors are from investigating the site and the relavant websites that talk about the colors for that brand.
You are looking to find the primary, secondary, and tertiary colors of this design system to save to research.

`,
    };
    this.toolType = "Research";

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [];

    // CONTENT
    this.content = (aiState: AIState, contentState: ContentState) => {
      return `${aiState.userContent}`;
    };
  }
}
