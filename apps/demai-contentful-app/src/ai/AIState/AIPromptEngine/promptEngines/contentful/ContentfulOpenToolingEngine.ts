import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";

export class ContentfulOpenToolingEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content: `You are an expert in Contentful, help this SE learn about Contentful demos.
        If you find that a tool would be useful, render that tool name in the output.`,
    };
    this.toolType = "Contentful";
    this.executionPrompt = "Updating Contentful...";
    this.introMessage =
      "Let’s work with Contentful, what would you like to do?";
    this.placeholder =
      "Describe what you would like to do with Contentful. Try to be descriptive...";
  }
}
