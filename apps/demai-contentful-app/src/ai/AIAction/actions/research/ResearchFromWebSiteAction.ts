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

export class ResearchFromWebSiteAction extends AIAction {
    static label = "Research Brand";

    static ACTION_RESEARCH_ID = "action";
    static ACTION_RESEARCH_BRAND_TONE = "Tone";
    static ACTION_RESEARCH_BRAND_STYLE = "Writing Style";
    static ACTION_RESEARCH_BRAND_DESCRIPTION = "Description";
    static ACTION_RESEARCH_BRAND_PRODUCT = "Product";
    static ACTION_RESEARCH_OPTIONS = [
        ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_DESCRIPTION,
        ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_PRODUCT,
        ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_STYLE,
        ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_TONE,
    ];

    static SOURCE_RESEARCH_ID = "source";
    static SOURCE_RESEARCH_PROSPECT = "the prospect";
    static SOURCE_RESEARCH_DESCRIPTION = "following description";
    static SOURCE_RESEARCH_OPTIONS = [
        ResearchFromWebSiteAction.SOURCE_RESEARCH_PROSPECT,
        ResearchFromWebSiteAction.SOURCE_RESEARCH_DESCRIPTION,
    ];

    async loadNeededData() {
        await this.loadProperty("research");
    }

    constructor(
        config: AIActionConfig,
        contentChangeEvent: () => void,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(
            config,
            contentChangeEvent,
            getContentState,
            loadProperty,
            snapshotOverrides,
        );

        this.model = AIModels.gpt4oSearchPreview;
        this.introMessage =
            "Let’s do some research. What would you like to do?";
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
                id: ResearchFromWebSiteAction.ACTION_RESEARCH_ID,
                options: ResearchFromWebSiteAction.ACTION_RESEARCH_OPTIONS,
                defaultValue:
                    ResearchFromWebSiteAction.ACTION_RESEARCH_BRAND_DESCRIPTION,
            },
            "of this brand from",
            {
                id: ResearchFromWebSiteAction.SOURCE_RESEARCH_ID,
                options: ResearchFromWebSiteAction.SOURCE_RESEARCH_OPTIONS,
                defaultValue:
                    ResearchFromWebSiteAction.SOURCE_RESEARCH_PROSPECT,
            },
            ".",
        ];

        // CONTENT
        this.content = (contentState: ContentState) => {
            const prospect = contentState.research?.fields.prospect;
            const mainWebsite = contentState.research?.fields.mainWebsite;
            const seDescription =
                contentState.research?.fields.solutionEngineerDescription;
            const useProspect =
                this.contextContentSelections[
                    ResearchFromWebSiteAction.SOURCE_RESEARCH_ID
                ] === ResearchFromWebSiteAction.SOURCE_RESEARCH_PROSPECT;

            const extra = useProspect
                ? `The prospect is \`${prospect}\` -- \` ${mainWebsite}\` -- ${seDescription}. Don't pull anymore than a couple paragraphs.`
                : "";

            const finalUserContent = this.userContent;
            return `${finalUserContent ? `${finalUserContent}. ` : ""}${extra}`;
        };
    }

    async runExe(addError: (err: AppError) => void) {
        this.updateSnapshot({
            isRunning: true,
            startExecutionRunTime: Date.now(),
        });

        const results = await super.runExe(addError);

        await this.runExeChildAction(
            new SaveBrandColorsAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
                this.loadProperty,
                {
                    response: `
The research below defines research on this brand. Use the \`update_brand\` tool and update.

${this.response}
`,
                },
            ),
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
