import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";
import * as icons from "@contentful/f36-icons";

export class EditContentTypeEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content: `You are an expert in Contentful, help this SE learn about Contentful demos.
        If you find that a tool would be useful, render that tool name in the output.`,
    };
    this.toolType = "Contentful";
    this.toolFilters = ["update_content_type"];
    this.contextContent = (contentState: ContentState) => [
      `Edit the content type with id of "${contentState.contentType?.sys.id}"`,
      ".",
    ];
    this.introMessage = "What would you like to do to this content type?";

    this.executionPrompt = "Updated your Content Types...";
    this.placeholder =
      "Describe what you would like to do to this content type. Try to be descriptive...";

    this.content = (aiState: AIState, contentState: ContentState) =>
      `${aiState.userContent}.
      Please show what you are going to do to the content type.
      Could you skip loading the content type and just use this information 
      
\`\`\`
${JSON.stringify(contentState.contentType)}
\`\`\``;

    this.prompts = {
      cancel: "Nope, Let's Rethink",
      run: "Yes, Let's Do These",
      cancelIcon: icons.DeleteIcon,
      runIcon: icons.StarIcon,
    };
  }
}
