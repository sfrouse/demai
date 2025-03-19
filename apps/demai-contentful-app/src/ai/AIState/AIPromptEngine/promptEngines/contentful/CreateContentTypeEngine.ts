import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";
import * as icons from "@contentful/f36-icons";

export class CreateContentTypeEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content: `You are an expert in Contentful, help this SE learn about Contentful demos.
        If you find that a tool would be useful, render that tool name in the output.`,
    };
    this.toolType = "Contentful";
    this.contextContent = () => [
      "Create",
      {
        id: "numberOfCTypes",
        options: ["1", "2", "3", "4", "5", "6"],
        defaultValue: "1",
      },
      "content types. Account for",
      {
        id: "context",
        options: ["no other content types", "all content types"],
        defaultValue: "no other content types",
      },
      ".",
    ];
    this.introMessage =
      "Let’s work with Content Types, what would you like to do?";

    this.executionPrompt = "Creating your Content Types...";
    this.placeholder =
      "Describe the kind of content type you would like. Try to be descriptive...";

    this.prompts = {
      cancel: "Nope, Let's Rethink",
      run: "Yes, Let's Create These",
      cancelIcon: icons.DeleteIcon,
      runIcon: icons.StarIcon,
    };
  }
}
