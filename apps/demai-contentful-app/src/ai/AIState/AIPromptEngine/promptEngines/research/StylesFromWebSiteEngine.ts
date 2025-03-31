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
In _every_ response include your answer in this format:

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

`,
    };
    this.toolType = "WebSearch";

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      "Find",
      {
        id: "styleTarget",
        options: [
          "The Primary Hex Color",
          "The Secondary Hex Color",
          "The Tertiary Hex Color",
          "The Semantic Hex Colors",
          "Three Brand Hex Colors",
        ],
        defaultValue: "The Primary Hex Color",
      },
      "from https://www.contentful.com.",
    ];

    // CONTENT
    this.content = (aiState: AIState, contentState: ContentState) => {
      return `${aiState.userContent}. Make sure to keep searching until you find a hex color.`;
    };
  }

  async run(aiState: AIState, chain: boolean = true) {
    const results = await super.run(aiState);

    if (chain) {
      // add stuff...
      const otherEngine = AIState.createAIPromptEngine(
        AIPromptEngineID.RESEARCH_STYLES,
        aiState
      );
      const aiStateClone = aiState.clone();
      aiStateClone.request =
        "Find a secondary color now for the same website. Choose only one.";
      const otherResults = await otherEngine.run(aiStateClone, false);
      console.log("otherResults", otherResults);

      return `${results}
      
### Secondary

${otherResults}
`;
    }
    return results;
  }
}
