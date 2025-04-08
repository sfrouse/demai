import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AIModels } from "../../../../openAI/openAIConfig";
import { AIPromptEngine } from "../../AIPromptEngine";
import createAIPromptEngine from "../../AIPromptEngineFactory";
import {
  AIPromptConfig,
  AIPromptContextContentSelections,
  AIPromptEngineID,
  PromptExecuteResults,
} from "../../AIPromptEngineTypes";

const ACTION_RESEARCH_ID = "action";
const ACTION_RESEARCH_BRAND_TONE = "Tone";
const ACTION_RESEARCH_BRAND_STYLE = "Writing Style";
const ACTION_RESEARCH_BRAND_DESCRIPTION = "Description";
const ACTION_RESEARCH_BRAND_PRODUCT = "Product";

const SOURCE_RESEARCH_ID = "source";
const SOURCE_RESEARCH_PROSPECT = "the prospect";
const SOURCE_RESEARCH_DESCRIPTION = "following description";

export class ResearchFromWebSiteEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

    this.model = AIModels.gpt4oSearchPreview;
    this.introMessage = "Let’s do some research. What would you like to do?";
    this.executionPrompt = "Researching...";
    this.placeholder = "Try to be descriptive...";
    this.system = {
      role: "system",
      content: `
You are an expert in figuring out a website's brand from investigating the site 
and the relavant websites that talk about the colors or tone for that brand.

Keep any summary you come up with to a paragraph or two at most.

`,
    };
    this.toolType = "WebSearch";

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      "Describe the ",
      {
        id: ACTION_RESEARCH_ID,
        options: [
          ACTION_RESEARCH_BRAND_DESCRIPTION,
          ACTION_RESEARCH_BRAND_PRODUCT,
          ACTION_RESEARCH_BRAND_STYLE,
          ACTION_RESEARCH_BRAND_TONE,
        ],
        defaultValue: ACTION_RESEARCH_BRAND_DESCRIPTION,
      },
      "of this brand from",
      {
        id: SOURCE_RESEARCH_ID,
        options: [SOURCE_RESEARCH_PROSPECT, SOURCE_RESEARCH_DESCRIPTION],
        defaultValue: SOURCE_RESEARCH_PROSPECT,
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
        contextContentSelections[SOURCE_RESEARCH_ID] ===
        SOURCE_RESEARCH_PROSPECT;

      const extra = useProspect
        ? `The prospect is \`${prospect}\` -- \` ${mainWebsite}\` -- ${seDescription}. Don't pull anymore than a couple paragraphs.`
        : "";

      const finalUserContent = userContent;
      return `${finalUserContent ? `${finalUserContent}. ` : ""}${extra}`;
    };
  }

  async runExe(
    // aiState: AIState,
    request: string | undefined,
    response: string | undefined,
    chain: boolean = true
  ) {
    const results = await super.runExe(request, response);

    await this.saveToneOrStyle(request, response, chain, results);

    return results;
  }

  async saveToneOrStyle(
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
The research below defines research on this brand. Use the \`update_brand\` tool and update.

${response}
`;
      const otherResults = await otherEngine.runExe(
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
