import AIState from "../../../AIState";
import { AIPromptEngineID } from "../../../AIStateTypes";
import { AIPromptEngine } from "../../AIPromptEngine";
import * as icons from "@contentful/f36-icons";

export class CreateContentTypeEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content: `
You are an expert in Contentful, help this SE learn about Contentful demos.
If you find that a tool would be useful, render that tool name in the output.
`,
    };
    this.toolType = "Contentful";
    this.toolFilters = ["create_content_type", "publish_content_type"];
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

  async runExe(
    aiState: AIState,
    chain?: boolean
  ): Promise<{ toolCalls: string[]; toolResults: any[] }> {
    const results = await super.runExe(aiState, chain);
    console.log("EXE", results);
    const newContentType = results.toolResults?.[0]?.content?.[0]?.text;
    console.log("newContentType", newContentType);
    let newContentTypeId;
    if (newContentType) {
      try {
        const newContentTypeObj = JSON.parse(newContentType);
        newContentTypeId = newContentTypeObj.sys.id;
      } catch {}
    }

    // publish as well...
    if (newContentTypeId) {
      const publishEngine = AIState.createAIPromptEngine(
        AIPromptEngineID.EDIT_CONTENT_TYPE, // has publish in it
        aiState
      );
      const aiStateClone = aiState.clone();
      aiStateClone.response = `publish the content type with id ${newContentTypeId}`;
      const otherResults = await publishEngine.runExe(aiStateClone, false);

      return {
        toolCalls: [...results.toolCalls, ...otherResults.toolCalls],
        toolResults: [...results.toolResults, ...otherResults.toolResults],
      };
    } else {
      return results;
    }
  }
}
