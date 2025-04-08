import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AIPromptEngine } from "../../AIPromptEngine";
import {
  AIPromptConfig,
  AIPromptContextContentSelections,
} from "../../AIPromptEngineTypes";

export class EditContentTypeEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

    this.introMessage = "What would you like to do to this content type?";
    this.executionPrompt = "Updated your Content Types...";
    this.placeholder =
      "Describe what you would like to do to this content type. Try to be descriptive...";
    this.system = {
      role: "system",
      content: `You are an expert in Contentful, help this SE learn about Contentful demos.
        If you find that a tool would be useful, render that tool name in the output.`,
    };
    this.toolType = "Contentful";
    this.toolFilters = [
      "update_content_type",
      "publish_content_type",
      "delete_content_type",
    ];

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      {
        id: "action",
        options: ["Edit", "Publish", "Delete"],
        defaultValue: "Edit",
      },
      `the content type with id of "${contentState.contentType?.sys.id}"`,
      ".",
    ];

    // CONTENT
    this.content = (
      userContent: string,
      contextContentSelections: AIPromptContextContentSelections,
      contentState: ContentState
    ) => {
      let extra = "";
      if (contextContentSelections["action"] === "Edit") {
        extra = `Please show what you are going to do to the content type.
Could you skip loading the content type and just use this information 
      
\`\`\`
${JSON.stringify(contentState.contentType)}
\`\`\`
`;
      }
      return `${userContent}. ${extra}`;
    };
  }
}
