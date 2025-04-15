import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { AIModels } from "../../../openAI/openAIConfig";
import { AIAction } from "../../AIAction";
import {
    AIActionConfig,
    AIActionPhase,
    AIActionSnapshot,
} from "../../AIActionTypes";
import { SaveBrandColorsAction } from "./SaveBrandColorsAction";

const SOURCE_ID = "source";
const SOURCE_PROSPECT = "the prospect";
const SOURCE_DESCRIPTION = "following description";

export class StylesFromWebSiteAction extends AIAction {
    static label = "Brand Colors";

    constructor(
        config: AIActionConfig,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, snapshotOverrides);

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
        this.contextContent = () => [
            "Find Three Brand Hex Colors from",
            {
                id: SOURCE_ID,
                options: [SOURCE_PROSPECT, SOURCE_DESCRIPTION],
                defaultValue: SOURCE_PROSPECT,
            },
        ];

        // CONTENT
        this.content = (contentState: ContentState) => {
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
    ) {
        const results = await super.runExe(contentState, addError);

        this.updateSnapshot({
            isRunning: true,
            startExecutionRunTime: Date.now(),
        });

        await this.runExeChildAction(
            new SaveBrandColorsAction(this.config, {
                response: `
The research below should have definitions for primary, secondary, or tertiary colors.
Find them and save to research:

${this.response}
`,
            }),

            contentState,
            addError,
            // results,
        );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });

        return results;
    }
}
