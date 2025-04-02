import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AIModels } from "../../../../openAI/openAIConfig";
import AIState from "../../../AIState";
import { AIPromptEngineID } from "../../../AIStateTypes";
import { AIPromptEngine } from "../../AIPromptEngine";

const ACTION_ID = "action";
const ACTION_HEX_COLORS = "Three Brand Hex Colors";
const ACTION_BRAND_TONE = "Brand Tone";
const ACTION_BRAND_STYLE = "Brand Style";
const ACTION_BRAND_DESCRIPTION = "Brand Description";
const ACTION_BRAND_PRODUCT = "Brand Product";

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
You are an expert in figuring out a website's brand from investigating the site 
and the relavant websites that talk about the colors or tone for that brand.

If you are asked about colors, make sure to get the exact *hex* color for the 
various brand colors that can fit into a "primary", "secondary", or "tertiary" 
schema and then double check your work to see if you got a hex color and if you got 
enough colors to satisfy the request.

If you are asked to summarize anything, keep it to a paragraph or two at most.

`,
    };
    this.toolType = "WebSearch";

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      "Find",
      {
        id: ACTION_ID,
        options: [
          ACTION_HEX_COLORS,
          ACTION_BRAND_DESCRIPTION,
          ACTION_BRAND_PRODUCT,
          ACTION_BRAND_STYLE,
          ACTION_BRAND_TONE,
        ],
        defaultValue: ACTION_HEX_COLORS,
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

    await this.saveColors(aiState, chain, results);
    await this.saveToneOrStyle(aiState, chain, results);

    return results;
  }

  async saveColors(
    aiState: AIState,
    chain: boolean = true,
    results: {
      toolCalls: string[];
      toolResults: any[];
    }
  ) {
    if (
      aiState.contextContentSelections[ACTION_ID] === ACTION_HEX_COLORS &&
      chain
    ) {
      // add stuff...
      const otherEngine = AIState.createAIPromptEngine(
        AIPromptEngineID.UPDATE_BRAND_COLORS,
        aiState
      );
      const aiStateClone = aiState.clone();
      console.log("aiStateClone", aiStateClone);
      aiStateClone.response = `
The research below should have definitions for primary, secondary, or tertiary colors.
Find them and save to research:

${aiState.response}
`;
      const otherResults = await otherEngine.runExe(aiStateClone, false);

      results.toolCalls = [...results.toolCalls, ...otherResults.toolCalls];
      results.toolResults = [
        ...results.toolResults,
        ...otherResults.toolResults,
      ];
    }
  }

  async saveToneOrStyle(
    aiState: AIState,
    chain: boolean = true,
    results: {
      toolCalls: string[];
      toolResults: any[];
    }
  ) {
    if (
      aiState.contextContentSelections[ACTION_ID] !== ACTION_HEX_COLORS &&
      chain
    ) {
      // add stuff...
      const otherEngine = AIState.createAIPromptEngine(
        AIPromptEngineID.UPDATE_BRAND_COLORS,
        aiState
      );
      const aiStateClone = aiState.clone();
      // otherEngine.toolFilters = [updateResearch.toolName];
      aiStateClone.response = `
The research below defines the ${aiState.contextContentSelections[ACTION_ID]} of this brand. Use the \`update_brand\` tool and update.

${aiState.response}
`;
      const otherResults = await otherEngine.runExe(aiStateClone, false);

      results.toolCalls = [...results.toolCalls, ...otherResults.toolCalls];
      results.toolResults = [
        ...results.toolResults,
        ...otherResults.toolResults,
      ];
    }
  }
}
