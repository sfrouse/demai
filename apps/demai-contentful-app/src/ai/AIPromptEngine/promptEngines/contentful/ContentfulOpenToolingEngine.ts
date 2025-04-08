import { AIPromptConfig, AIPromptEngine } from "../../AIPromptEngine";

export class ContentfulOpenToolingEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

    this.system = {
      role: "system",
      content: `
You are an expert in Contentful, help this SE learn about Contentful demos.
Tell me explicitly what you are about to do including the name of the tool - this is the most important part of your task.

`,
    };
    this.toolType = "Contentful";
    this.executionPrompt = "Updating Contentful...";
    this.introMessage =
      "Let’s work with Contentful, what would you like to do?";
    this.placeholder =
      "Describe what you would like to do with Contentful. Try to be descriptive...";
  }
}
