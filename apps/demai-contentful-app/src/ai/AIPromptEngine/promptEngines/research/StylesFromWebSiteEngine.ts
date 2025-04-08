import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AIModels } from "../../../openAI/openAIConfig";
import { AIPromptEngine } from "../../AIPromptEngine";
import createAIPromptEngine from "../../AIPromptEngineFactory";
import {
  AIPromptConfig,
  AIPromptContextContentSelections,
  AIPromptEngineID,
  PromptExecuteResults,
} from "../../AIPromptEngineTypes";

const SOURCE_ID = "source";
const SOURCE_PROSPECT = "the prospect";
const SOURCE_DESCRIPTION = "following description";

export class StylesFromWebSiteEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

    this.model = AIModels.gpt4oSearchPreview;
    this.introMessage = "Let’s do some research. What would you like to do?";
    this.executionPrompt = "Researching...";
    this.placeholder = "Try to be descriptive...";
    this.system = {
      role: "system",
      content: `
You are an expert in figuring out a website's brand colors from investigating the site 
and the relavant websites that talk about the colors or tone for that brand.

Make sure to get the exact *hex* color for the 
various brand colors that can fit into a "primary", "secondary", or "tertiary" 
schema and then double check your work to see if you got a hex color and if you got 
enough colors to satisfy the request.

`,
    };
    this.toolType = "WebSearch";

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      "Find Three Brand Hex Colors from",
      {
        id: SOURCE_ID,
        options: [SOURCE_PROSPECT, SOURCE_DESCRIPTION],
        defaultValue: SOURCE_PROSPECT,
      },
      ".",
    ];

    // CONTENT
    this.content = (
      userContent: string,
      contextContentSelections: AIPromptContextContentSelections,
      contentState: ContentState
    ) => {
      const prospect = contentState.research?.fields.prospect;
      const mainWebsite = contentState.research?.fields.mainWebsite;
      const seDescription =
        contentState.research?.fields.solutionEngineerDescription;
      const useProspect =
        contextContentSelections[SOURCE_ID] === SOURCE_PROSPECT;

      const extra = useProspect
        ? `The prospect is \`${prospect}\` -- \` ${mainWebsite}\` -- ${seDescription}. Don't pull anymore than a couple paragraphs.`
        : "";

      return `${userContent ? `${userContent}. ` : ""}${extra}`;
    };
  }

  async runExe(
    // aiState: AIState,
    request: string | undefined,
    response: string | undefined,
    chain: boolean = true
  ) {
    const results = await super.runExe(request, response);

    await this.saveColors(request, response, chain, results);

    return results;
  }

  async saveColors(
    // aiState: AIState,
    request: string | undefined,
    response: string | undefined,
    chain: boolean = true,
    results: PromptExecuteResults
  ) {
    if (chain) {
      // add stuff...
      const otherEngine = createAIPromptEngine(
        AIPromptEngineID.UPDATE_BRAND_COLORS,
        this.config
      );
      const finalResponse = `
The research below should have definitions for primary, secondary, or tertiary colors.
Find them and save to research:

${response}
`;
      const otherResults = await otherEngine.runExe(
        // aiStateClone,
        request,
        finalResponse,
        false
      );

      if (otherResults.success === false) results.success = false;
      results.toolCalls = [...results.toolCalls, ...otherResults.toolCalls];
      results.toolResults = [
        ...results.toolResults,
        ...otherResults.toolResults,
      ];
    }
  }
}
