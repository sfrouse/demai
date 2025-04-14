import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { AIModels } from "../../../openAI/openAIConfig";
import { AIAction } from "../../AIAction";
import {
    AIActionConfig,
    AIActionContextContentSelections,
    AIActionExecuteResults,
} from "../../AIActionTypes";

const SOURCE_ID = "source";
const SOURCE_PROSPECT = "the prospect";
const SOURCE_DESCRIPTION = "following description";

export class StylesFromWebSiteAction extends AIAction {
    constructor(config: AIActionConfig) {
        super(config);

        this.model = AIModels.gpt4oSearchPreview;
        this.introMessage =
            "Let’s do some research. What would you like to do?";
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
        this.content = (contentState: ContentState) => {
            console.log("content", this.userContent);
            const prospect = contentState.research?.fields.prospect;
            const mainWebsite = contentState.research?.fields.mainWebsite;
            const seDescription =
                contentState.research?.fields.solutionEngineerDescription;
            const useProspect =
                this.contextContentSelections[SOURCE_ID] === SOURCE_PROSPECT;

            const extra = useProspect
                ? `The prospect is \`${prospect}\` -- \` ${mainWebsite}\` -- ${seDescription}. Don't pull anymore than a couple paragraphs.`
                : "";

            return `${this.userContent ? `${this.userContent}. ` : ""}${extra}`;
        };
    }

    async runExe(
        contentState: ContentState,
        addError: (err: AppError) => void,
        chain: boolean = true,
    ) {
        const results = await super.runExe(contentState, addError);

        await this.saveColors(contentState, addError, chain, results);

        return results;
    }

    async saveColors(
        contentState: ContentState,
        addError: (err: AppError) => void,
        chain: boolean = true,
        results: AIActionExecuteResults,
    ) {
        //     if (chain) {
        //       // add stuff...
        //       const otherEngine = createAIActionEngine(
        //         AIActionEngineID.UPDATE_BRAND_COLORS,
        //         this.config
        //       );
        //       const finalResponse = `
        // The research below should have definitions for primary, secondary, or tertiary colors.
        // Find them and save to research:
        // ${response}
        // `;
        //       const otherResults = await otherEngine.runExe(
        //         // aiStateClone,
        //         request,
        //         finalResponse,
        //         addError,
        //         false
        //       );
        //       if (otherResults.success === false) results.success = false;
        //       results.toolCalls = [...results.toolCalls, ...otherResults.toolCalls];
        //       results.toolResults = [
        //         ...results.toolResults,
        //         ...otherResults.toolResults,
        //       ];
        //     }
    }
}
