import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AIModels } from "../../../../openAI/openAIConfig";
import AIState from "../../../AIState";
import { AIPromptEngineID } from "../../../AIStateTypes";
import { AIPromptEngine } from "../../AIPromptEngine";

export class StylesFromWebSiteEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.model = AIModels.gpt4oSearchPreview;
    this.introMessage = "Let’s do some research. What would you like to do?";
    this.executionPrompt = "Researching...";
    this.placeholder = "Try to be descriptive...";
    this.system = {
      role: "system",
      content: `
You are an expert in design system colors and can figure out what a website's brand design system colors are from investigating the site and the relavant websites that talk about the colors for that brand.
Make sure to get the exact *hex* color for the various brand colors that can fit into a "primary", "secondary", or "tertiary" schema.
Double check your work to see if you got a hex color and if you got enough colors to satisfy the request.

`,
    };
    this.toolType = "WebSearch";

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      "Find",
      {
        id: "styleTarget",
        options: [
          // "The Primary Hex Color",
          // "The Secondary Hex Color",
          // "The Tertiary Hex Color",
          // "The Semantic Hex Colors",
          "Three Brand Hex Colors",
        ],
        defaultValue: "Three Brand Hex Colors",
      },
      "from",
    ];

    // CONTENT
    this.content = (aiState: AIState, contentState: ContentState) => {
      return `${aiState.userContent}`;
    };
  }

  async runExe(aiState: AIState, chain: boolean = true) {
    const results = await super.runExe(aiState);

    if (chain) {
      // add stuff...
      const otherEngine = AIState.createAIPromptEngine(
        AIPromptEngineID.SAVE_BRAND_COLORS,
        aiState
      );
      const aiStateClone = aiState.clone();
      aiStateClone.response = `
The research below should have definitions for primary, secondary, or tertiary colors.
Find them and save to research:

${aiState.response}
`;
      const otherResults = await otherEngine.runExe(aiStateClone, false);
      console.log("otherResults", otherResults);

      return {
        toolCalls: [...results.toolCalls, ...otherResults.toolCalls],
        toolResults: [...results.toolResults, ...otherResults.toolResults],
      };
    }
    return results;
  }
}

/*
\`\`\`
{
    "colors" : {
        "primary": "#ff0000",
        "secondary": "#ff0000",
        "tertiary": "#ff0000",
    }
}
\`\`\`

Only answer the questions that you researched. For instance do not even include "secondary" or "tertiary" if you were not asked to show them.
*/
