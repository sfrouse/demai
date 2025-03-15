import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";

export class CreateContentTypeEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content:
        "You are an expert in Contentful, help this SE learn about Contentful demos. If you find that a tool would be useful, render that tool name in the output.",
    };
    this.toolType = "Contentful";
    this.contextContent = [
      "Create",
      { options: ["1", "2", "3", "4", "5", "6"], value: "1" },
      "content types",
      "about",
    ];
    this.introMessage =
      "Let’s work with Content Types, what would you like to do?";

    this.executionPrompt =
      "Would you like to proceed with making these new Content Types?";
    this.placeholder =
      "Describe the kind of content type you would like. Try to be descriptive...";
  }
}
